import React, { useRef, useState, useEffect, useCallback } from "react";
import "../styles/base.css"; // keep your existing base

export default function ImageAside({
  src,
  alt = "Preview image",
  label = "Preview",
  stickyRef = null,
  onScrollPercent = null,
  hiResSrc = null, // optional hi-res source for extreme zoom
}) {
  const INITIAL_SCALE = 10; // 1000%
  const MIN_SCALE = 0.1;
  const MAX_SCALE = 30;

  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(INITIAL_SCALE);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // panning / pointer bookkeeping
  const startPan = useRef(null);
  const isPanningRef = useRef(false);

  // refs for DOM
  const viewerRef = useRef(null);
  const ivImageRef = useRef(null);
  const previewRef = useRef(null);
  const stickyFrameRef = useRef(null);

  // pointer maps
  const pointers = useRef(new Map());
  const lastPinch = useRef(null);
  const pointersPreview = useRef(new Map());
  const previewPinchStart = useRef(null);

  // rAF batching refs
  const pendingScale = useRef(scale);
  const pendingTranslate = useRef(translate);
  const rafFlush = useRef(null);
  const isInteracting = useRef(false);

  // momentum
  const lastMove = useRef({ t: 0, x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const momentumRaf = useRef(null);

  /* ---------- helpers ---------- */
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  // compute container-fitted base size then scaled size -> constrain translate
  const constrainTranslate = useCallback((tx, ty, s) => {
    const img = ivImageRef.current;
    const win = viewerRef.current;
    if (!img || !win) return { x: tx, y: ty };

    const naturalW = img.naturalWidth || img.width;
    const naturalH = img.naturalHeight || img.height;
    if (!naturalW || !naturalH) return { x: tx, y: ty };

    const containerRect = win.getBoundingClientRect();
    const containerW = containerRect.width;
    const containerH = containerRect.height;

    const imgAspect = naturalW / naturalH;
    const containerAspect = containerW / containerH;
    let baseW, baseH;
    if (imgAspect > containerAspect) {
      baseW = containerW;
      baseH = containerW / imgAspect;
    } else {
      baseH = containerH;
      baseW = containerH * imgAspect;
    }

    const scaledW = baseW * s;
    const scaledH = baseH * s;

    const maxX = Math.max(0, (scaledW - containerW) / 2);
    const maxY = Math.max(0, (scaledH - containerH) / 2);

    return { x: clamp(tx, -maxX, maxX), y: clamp(ty, -maxY, maxY) };
  }, []);

  /* ---------- rAF batching: commit pendingScale/Translate once per frame ---------- */
  function scheduleFlush() {
    if (rafFlush.current) return;
    rafFlush.current = window.requestAnimationFrame(() => {
      rafFlush.current = null;
      // apply pending values
      const s = pendingScale.current;
      const t = pendingTranslate.current;
      // apply without transition to avoid flicker while interacting
      setScale(s);
      setTranslate(t);
    });
  }

  // call this to update zoom/translate during pointer/wheel without setState flooding
  function applyPending(nextScale, nextTranslate) {
    pendingScale.current = nextScale;
    pendingTranslate.current = nextTranslate;
    scheduleFlush();
  }

  /* ---------- Forward stickyRef and attach scroll listener ---------- */
  useEffect(() => {
    if (stickyRef) {
      if (typeof stickyRef === "object")
        stickyRef.current = stickyFrameRef.current;
      else if (typeof stickyRef === "function")
        stickyRef(stickyFrameRef.current);
    }

    const el = stickyFrameRef.current;
    if (!el) return () => {};

    let raf = null;
    const updatePercent = () => {
      const scrollTop = el.scrollTop;
      const scrollHeight = Math.max(1, el.scrollHeight - el.clientHeight);
      const percent = Math.round((scrollTop / scrollHeight) * 100);
      if (typeof onScrollPercent === "function") onScrollPercent(percent);
      raf = null;
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(updatePercent);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    updatePercent();

    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      if (stickyRef) {
        if (typeof stickyRef === "object" && stickyRef.current === el)
          stickyRef.current = null;
        else if (typeof stickyRef === "function") {
          try {
            stickyRef(null);
          } catch {
            /*error*/
          }
        }
      }
    };
  }, [stickyRef, onScrollPercent]);

  /* ---------- block browser pinch-to-zoom while overlay open ---------- */
  useEffect(() => {
    if (!open) return;
    const preventPinch = (e) => {
      if (e.touches && e.touches.length > 1) e.preventDefault();
    };
    const preventGesture = (e) => e.preventDefault();
    document.addEventListener("touchstart", preventPinch, { passive: false });
    document.addEventListener("touchmove", preventPinch, { passive: false });
    document.addEventListener("gesturestart", preventGesture);
    return () => {
      document.removeEventListener("touchstart", preventPinch, {
        passive: false,
      });
      document.removeEventListener("touchmove", preventPinch, {
        passive: false,
      });
      document.removeEventListener("gesturestart", preventGesture);
    };
  }, [open]);

  /* ---------- prevent ctrl/meta wheel page zoom while overlay open ---------- */
  const onWheelCapture = useCallback(
    (e) => {
      if (open && (e.ctrlKey || e.metaKey)) e.preventDefault();
    },
    [open]
  );
  useEffect(() => {
    document.addEventListener("wheel", onWheelCapture, {
      passive: false,
      capture: true,
    });
    return () =>
      document.removeEventListener("wheel", onWheelCapture, { capture: true });
  }, [onWheelCapture]);

  // ESC to close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- wheel zoom: compute next target and schedule via batcher ---------- */
  function onWheel(e) {
    if (!open) return;
    e.preventDefault();

    const delta = -e.deltaY || 0;
    // exponential zoom for quick range traversal
    const zoomExp = Math.exp(delta / 300);
    const next = clamp(pendingScale.current * zoomExp, MIN_SCALE, MAX_SCALE);

    const rect = viewerRef.current?.getBoundingClientRect();
    if (!rect) {
      applyPending(next, pendingTranslate.current);
      return;
    }

    const cx =
      e.clientX - rect.left - rect.width / 2 - pendingTranslate.current.x;
    const cy =
      e.clientY - rect.top - rect.height / 2 - pendingTranslate.current.y;
    const ratio = next / pendingScale.current;
    const nx = pendingTranslate.current.x - cx * (ratio - 1);
    const ny = pendingTranslate.current.y - cy * (ratio - 1);

    const limited = constrainTranslate(nx, ny, next);
    applyPending(next, limited);
  }

  /* ---------- overlay pointer handlers (pan + pinch) ---------- */
  function onPointerDown(e) {
    try {
      e.target.setPointerCapture?.(e.pointerId);
    } catch {
      /*error*/
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // cancel momentum if active
    if (momentumRaf.current) {
      cancelAnimationFrame(momentumRaf.current);
      momentumRaf.current = null;
      velocity.current = { x: 0, y: 0 };
    }

    if (pointers.current.size === 1) {
      startPan.current = {
        x: e.clientX - pendingTranslate.current.x,
        y: e.clientY - pendingTranslate.current.y,
      };
      isPanningRef.current = true;
      isInteracting.current = true;
      lastMove.current = { t: performance.now(), x: e.clientX, y: e.clientY };
    } else if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      lastPinch.current = distance(a, b);
    }
  }

  function onPointerMove(e) {
    if (!open) return;
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (
      pointers.current.size === 1 &&
      isPanningRef.current &&
      startPan.current
    ) {
      const nx = e.clientX - startPan.current.x;
      const ny = e.clientY - startPan.current.y;
      const limited = constrainTranslate(nx, ny, pendingScale.current);
      // update velocity
      const now = performance.now();
      const dt = Math.max(1, now - lastMove.current.t);
      const vx = (e.clientX - lastMove.current.x) / dt;
      const vy = (e.clientY - lastMove.current.y) / dt;
      velocity.current = { x: vx, y: vy };
      lastMove.current = { t: now, x: e.clientX, y: e.clientY };

      applyPending(pendingScale.current, limited);
    } else if (pointers.current.size === 2) {
      const arr = Array.from(pointers.current.values());
      const d = distance(arr[0], arr[1]);
      if (lastPinch.current && Math.abs(d - lastPinch.current) > 2) {
        const ratio = d / lastPinch.current;
        const nextScale = clamp(
          pendingScale.current * ratio,
          MIN_SCALE,
          MAX_SCALE
        );

        const rect = viewerRef.current?.getBoundingClientRect();
        if (!rect) {
          pendingScale.current = nextScale;
          lastPinch.current = d;
          scheduleFlush();
          return;
        }

        const centerX =
          (arr[0].x + arr[1].x) / 2 -
          rect.left -
          rect.width / 2 -
          pendingTranslate.current.x;
        const centerY =
          (arr[0].y + arr[1].y) / 2 -
          rect.top -
          rect.height / 2 -
          pendingTranslate.current.y;
        const ratio2 = nextScale / pendingScale.current;
        const nx = pendingTranslate.current.x - centerX * (ratio2 - 1);
        const ny = pendingTranslate.current.y - centerY * (ratio2 - 1);
        const limited = constrainTranslate(nx, ny, nextScale);
        pendingScale.current = nextScale;
        pendingTranslate.current = limited;
        lastPinch.current = d;
        scheduleFlush();
      }
    }
  }

  function startMomentum() {
    const friction = 0.95;
    const minV = 0.0005;
    let vx = velocity.current.x;
    let vy = velocity.current.y;

    function step() {
      const dt = 16;
      const dx = vx * dt * 16; // feel tweak
      const dy = vy * dt * 16;
      let nextTx = pendingTranslate.current.x + dx;
      let nextTy = pendingTranslate.current.y + dy;
      const limited = constrainTranslate(nextTx, nextTy, pendingScale.current);

      pendingTranslate.current = limited;
      setTranslate(limited); // small direct commit for momentum smoothness

      vx *= friction;
      vy *= friction;

      if (Math.hypot(vx, vy) < minV) {
        momentumRaf.current = null;
        velocity.current = { x: 0, y: 0 };
        return;
      }
      velocity.current = { x: vx, y: vy };
      momentumRaf.current = requestAnimationFrame(step);
    }

    if (Math.hypot(velocity.current.x, velocity.current.y) > 0.002) {
      momentumRaf.current = requestAnimationFrame(step);
    } else {
      velocity.current = { x: 0, y: 0 };
    }
  }

  function onPointerUp(e) {
    pointers.current.delete(e.pointerId);
    try {
      e.target.releasePointerCapture?.(e.pointerId);
    } catch {
      /*error*/
    }
    if (pointers.current.size === 0) {
      isPanningRef.current = false;
      startPan.current = null;
      lastPinch.current = null;
      isInteracting.current = false;
      if (Math.hypot(velocity.current.x, velocity.current.y) > 0.002)
        startMomentum();
    }
  }

  /* ---------- preview pinch -> open overlay seeded ---------- */
  function onPreviewPointerDown(e) {
    try {
      e.target.setPointerCapture?.(e.pointerId);
    } catch {
      /*error*/
    }
    pointersPreview.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersPreview.current.size === 2) {
      const arr = Array.from(pointersPreview.current.values());
      previewPinchStart.current = distance(arr[0], arr[1]);
      e.preventDefault?.();
    }
  }

  function onPreviewPointerMove(e) {
    if (!pointersPreview.current.has(e.pointerId)) return;
    pointersPreview.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersPreview.current.size === 2 && previewPinchStart.current) {
      const arr = Array.from(pointersPreview.current.values());
      const nowD = distance(arr[0], arr[1]);
      const ratio = nowD / previewPinchStart.current;

      if (!open && Math.abs(ratio - 1) > 0.06) {
        setOpen(true);
        const initialScale = clamp(
          INITIAL_SCALE * ratio * 1.2,
          MIN_SCALE,
          MAX_SCALE
        );
        const centerX = (arr[0].x + arr[1].x) / 2;
        const centerY = (arr[0].y + arr[1].y) / 2;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const cx = centerX - vw / 2;
        const cy = centerY - vh / 2;
        const seedTranslate = { x: -cx * 0.15, y: -cy * 0.15 };
        const limited = constrainTranslate(
          seedTranslate.x,
          seedTranslate.y,
          initialScale
        );
        pendingScale.current = initialScale;
        pendingTranslate.current = limited;
        scheduleFlush();
        previewPinchStart.current = null;
        pointersPreview.current.clear();
      } else {
        e.preventDefault?.();
      }
    }
  }

  function onPreviewPointerUp(e) {
    try {
      e.target.releasePointerCapture?.(e.pointerId);
    } catch {
      /*error*/
    }
    pointersPreview.current.delete(e.pointerId);
    if (pointersPreview.current.size === 0) previewPinchStart.current = null;
  }

  /* ---------- double-tap => zoom toggle near pointer ---------- */
  const lastClick = useRef(0);
  function onDoubleClick(e) {
    const now = Date.now();
    if (now - lastClick.current < 350) {
      const rect = viewerRef.current?.getBoundingClientRect();
      const clientX = e?.clientX ?? window.innerWidth / 2;
      const clientY = e?.clientY ?? window.innerHeight / 2;
      const targetScale =
        scale > INITIAL_SCALE * 1.15
          ? INITIAL_SCALE
          : clamp(scale * 2, MIN_SCALE, MAX_SCALE);
      if (rect) {
        const cx = clientX - rect.left - rect.width / 2 - translate.x;
        const cy = clientY - rect.top - rect.height / 2 - translate.y;
        const ratio = targetScale / scale;
        const nx = translate.x - cx * (ratio - 1);
        const ny = translate.y - cy * (ratio - 1);
        const limited = constrainTranslate(nx, ny, targetScale);
        pendingScale.current = targetScale;
        pendingTranslate.current = limited;
        scheduleFlush();
      } else {
        pendingScale.current = targetScale;
        scheduleFlush();
      }
      lastClick.current = 0;
    } else lastClick.current = now;
  }

  function preventDrag(e) {
    e.preventDefault();
  }

  /* ---------- actions ---------- */
  function onClose() {
    setOpen(false);
  }
  function onMinimize() {
    pendingScale.current = INITIAL_SCALE;
    pendingTranslate.current = { x: 0, y: 0 };
    scheduleFlush();
    setOpen(false);
  }
  function onZoomMax() {
    pendingScale.current = clamp(
      pendingScale.current * 1.5,
      MIN_SCALE,
      MAX_SCALE
    );
    scheduleFlush();
  }

  /* ---------- optional hi-res preloading (avoid pixelation at high zoom) ---------- */
  useEffect(() => {
    if (!hiResSrc) return;
    let mounted = true;
    let rafId = null;
    const img = new Image();
    img.onload = () => {
      if (!mounted) return;
      rafId = requestAnimationFrame(() => {
        if (mounted) {
          /* keep preloaded in browser cache */
        }
      });
    };
    img.onerror = () => {
      if (!mounted) {
        /* empty */
      }
    };
    img.src = hiResSrc;
    return () => {
      mounted = false;
      img.onload = null;
      img.onerror = null;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [hiResSrc]);

  /* ---------- cleanup rAFs on unmount ---------- */
  useEffect(() => {
    return () => {
      if (rafFlush.current) cancelAnimationFrame(rafFlush.current);
      if (momentumRaf.current) cancelAnimationFrame(momentumRaf.current);
    };
  }, []);

  /* ---------- render ---------- */
  // choose actual image src (if hiRes provided and scale large, you might swap; here we always use src for simplicity)
  const actualSrc = src;

  return (
    <>
      <aside className="project-left" aria-label={label}>
        <div
          className="sticky-frame"
          ref={stickyFrameRef}
          role="region"
          aria-label="image preview frame"
        >
          <img
            ref={previewRef}
            alt={alt}
            className="left-long-image interactive-image"
            src={actualSrc}
            onDragStart={preventDrag}
            onPointerDown={onPreviewPointerDown}
            onPointerMove={onPreviewPointerMove}
            onPointerUp={onPreviewPointerUp}
            onPointerCancel={onPreviewPointerUp}
            style={{ touchAction: "none" }}
          />
          <div className="maximize-parent">
            <button
              className="mac-maximize maximize-btn"
              title="Open preview"
              aria-label="Open preview"
              onClick={() => {
                setOpen(true);
                // seed visible values to avoid jump
                pendingScale.current = INITIAL_SCALE;
                pendingTranslate.current = { x: 0, y: 0 };
                scheduleFlush();
              }}
              type="button"
            />
          </div>
        </div>
      </aside>

      {/* overlay */}
      <div
        className={`iv-overlay ${open ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <div
          className="iv-window"
          ref={viewerRef}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={onDoubleClick}
        >
          <div className="iv-topbar">
            <div className="mac-controls">
              <button
                aria-label="close"
                className="mac mac-close"
                onClick={onClose}
              />
              <button
                aria-label="minimize"
                className="mac mac-min"
                onClick={onMinimize}
              />
              <button
                aria-label="zoom"
                className="mac mac-zoom"
                onClick={onZoomMax}
              />
            </div>

            <div className="iv-title">Preview</div>

            <div className="iv-actions">
              <div className="zoom-display">
                {Math.round((pendingScale.current || scale) * 100)}%
              </div>

              <button
                className="iv-btn"
                onClick={() => {
                  pendingScale.current = INITIAL_SCALE;
                  pendingTranslate.current = { x: 0, y: 0 };
                  scheduleFlush();
                }}
              >
                Fit
              </button>

              <button
                className="iv-btn"
                onClick={() => {
                  pendingScale.current = clamp(
                    pendingScale.current * 1.25,
                    MIN_SCALE,
                    MAX_SCALE
                  );
                  scheduleFlush();
                }}
              >
                +
              </button>

              <button
                className="iv-btn"
                onClick={() => {
                  pendingScale.current = clamp(
                    pendingScale.current / 1.25,
                    MIN_SCALE,
                    MAX_SCALE
                  );
                  scheduleFlush();
                }}
              >
                −
              </button>

              <div className="zoom-slider">
                <button
                  className="slide-icon"
                  onClick={() => {
                    const cur = scaleToSlider(pendingScale.current || scale);
                    const next = Math.max(0, cur - 6);
                    pendingScale.current = sliderToScale(next);
                    scheduleFlush();
                  }}
                >
                  −
                </button>

                <input
                  className="slider"
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={scaleToSlider(pendingScale.current || scale)}
                  onChange={(ev) => {
                    const v = Number(ev.target.value);
                    pendingScale.current = sliderToScale(v);
                    scheduleFlush();
                  }}
                />

                <button
                  className="slide-icon"
                  onClick={() => {
                    const cur = scaleToSlider(pendingScale.current || scale);
                    const next = Math.min(100, cur + 6);
                    pendingScale.current = sliderToScale(next);
                    scheduleFlush();
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="iv-body">
            <img
              ref={ivImageRef}
              src={actualSrc}
              alt={alt}
              draggable={false}
              onDragStart={preventDrag}
              className="iv-image"
              style={{
                transform: `translate3d(${
                  pendingTranslate.current?.x ?? translate.x
                }px, ${
                  pendingTranslate.current?.y ?? translate.y
                }px, 0) scale(${pendingScale.current ?? scale})`,
                transition: isInteracting.current
                  ? "none"
                  : "transform 120ms cubic-bezier(.2,.9,.2,1)",
                willChange: "transform",
                maxWidth: "none",
                maxHeight: "none",
                imageRendering: "auto",
              }}
            />
          </div>

          <div className="iv-footer">
            <div className="hint">
              Use wheel / pinch to zoom. Drag to pan. Slider and + / - for quick
              jumps. Double-tap to toggle. Esc or click outside to close.
            </div>
          </div>
        </div>
      </div>
    </>
  );

  /* ---------- slider helpers (log scale) ---------- */

  function scaleToSlider(s) {
    const logMin = Math.log(MIN_SCALE);
    const logMax = Math.log(MAX_SCALE);
    const v = (Math.log(s) - logMin) / (logMax - logMin);
    return v * 100;
  }
  function sliderToScale(v) {
    const logMin = Math.log(MIN_SCALE);
    const logMax = Math.log(MAX_SCALE);
    const t = v / 100;
    const s = Math.exp(logMin + t * (logMax - logMin));
    return clamp(s, MIN_SCALE, MAX_SCALE);
  }
}
