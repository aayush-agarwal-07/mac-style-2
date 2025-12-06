// src/components/ImageAside.jsx
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import "../styles/base.css";

/**
 * ImageAside
 * Props:
 *  - src (string) : preview (low/normal) src shown in sticky-frame
 *  - hiResSrc (string|optional): hi-res image used inside overlay to avoid pixelation
 *  - alt, label
 *  - stickyRef (optional) : object or function to forward sticky-frame node
 *  - onScrollPercent(percent) optional callback
 *
 * Key improvements:
 *  - preloads hiResSrc for overlay
 *  - applies transform directly to DOM (rAF) for snappy interaction -> no white flashes
 *  - exposes slider + logarithmic mapping for large zoom ranges
 *  - prevents native pinch-to-zoom while overlay open
 */
export default function ImageAside({
  src,
  hiResSrc = null,
  alt = "Preview image",
  label = "Preview",
  stickyRefCallback = null,
  onScrollPercent = null,
}) {
  // zoom units: scale multiplier (1 = 100%). We use INITIAL_SCALE = 10 (1000%) like you asked.
  const INITIAL_SCALE = 10;
  const MIN_SCALE = 0.1; // 10%
  const MAX_SCALE = 30; // 3000%+

  // overlay open state & UI state
  const [open, setOpen] = useState(false);
  // keep a light state for UI (zoom display + slider). The heavy realtime transform uses refs + direct DOM writes
  const [uiScale, setUiScale] = useState(INITIAL_SCALE);
  const [hiResLoaded, setHiResLoaded] = useState(false);

  // refs for DOM nodes
  const stickyFrameRef = useRef(null);
  const previewRef = useRef(null); // preview image element in sticky frame
  const viewerRef = useRef(null); // whole overlay window
  const ivImageRef = useRef(null); // image inside overlay

  // pointer / pinch state
  const pointers = useRef(new Map());
  const pointersPreview = useRef(new Map());
  const previewPinchStart = useRef(null);
  const lastPinch = useRef(null);
  const startPan = useRef(null);
  const isPanning = useRef(false);

  // momentum
  const lastMove = useRef({ t: 0, x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const momentumRaf = useRef(null);

  // "live" transform values (refs to avoid React rerenders)
  const currentScale = useRef(INITIAL_SCALE);
  const currentTranslate = useRef({ x: 0, y: 0 });

  // rAF handle to batch DOM writes
  const raf = useRef(null);

  /* ---------- small helpers ---------- */
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  // mapping for slider (logarithmic)
  const logMin = useMemo(() => Math.log(MIN_SCALE), []);
  const logMax = useMemo(() => Math.log(MAX_SCALE), []);
  const scaleToSlider = useCallback(
    (s) => {
      const v = (Math.log(s) - logMin) / (logMax - logMin);
      return v * 100;
    },
    [logMin, logMax]
  );
  const sliderToScale = useCallback(
    (v) => {
      const t = v / 100;
      const s = Math.exp(logMin + t * (logMax - logMin));
      return clamp(s, MIN_SCALE, MAX_SCALE);
    },
    [logMin, logMax]
  );

  /* ---------- Constrain translate to image/container sizes.
       Uses ivImageRef (which will point to the hi-res or src image element).
  ---------- */
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

    const cx = clamp(tx, -maxX, maxX);
    const cy = clamp(ty, -maxY, maxY);
    return { x: cx, y: cy };
  }, []);

  /* ---------- expose stickyFrame DOM node to parent (object or function) and attach scroll event ---------- */
  // NEW — accept a callback prop named stickyRefCallback
  useEffect(() => {
    // if a callback provided, call it with the node (or null on cleanup)
    if (typeof stickyRefCallback === "function") {
      try {
        stickyRefCallback(stickyFrameRef.current);
      } catch {
        /*error*/
      }
    }

    const el = stickyFrameRef.current;
    if (!el) return () => {};

    let frameHandle = null;
    const updatePercent = () => {
      const scrollTop = el.scrollTop;
      const scrollHeight = Math.max(1, el.scrollHeight - el.clientHeight);
      const percent = Math.round((scrollTop / scrollHeight) * 100);
      if (typeof onScrollPercent === "function") onScrollPercent(percent);
      frameHandle = null;
    };

    const onScroll = () => {
      if (frameHandle) return;
      frameHandle = requestAnimationFrame(updatePercent);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    updatePercent();

    return () => {
      el.removeEventListener("scroll", onScroll);
      if (frameHandle) cancelAnimationFrame(frameHandle);
      // cleanup callback
      if (typeof stickyRefCallback === "function") {
        try {
          stickyRefCallback(null);
        } catch {
          /*error*/
        }
      }
    };
  }, [stickyRefCallback, onScrollPercent]);

  /* ---------- preload hiResSrc for overlay for crisp zoom (desktop) ---------- */
  // preload hi-res image (robust + avoids cascading setState warning)
  useEffect(() => {
    if (!hiResSrc) {
      // schedule the false update off the immediate effect callback
      const id = window.requestAnimationFrame(() => setHiResLoaded(false));
      return () => window.cancelAnimationFrame(id);
    }

    let mounted = true;
    let rafId = null;
    const img = new Image();

    const handleLoad = () => {
      if (!mounted) return;
      // defer the actual setState to next animation frame to avoid synchronous cascade
      rafId = window.requestAnimationFrame(() => {
        if (mounted) setHiResLoaded(true);
      });
    };

    const handleErr = () => {
      if (!mounted) return;
      rafId = window.requestAnimationFrame(() => {
        if (mounted) setHiResLoaded(false);
      });
    };

    img.onload = handleLoad;
    img.onerror = handleErr;
    img.src = hiResSrc;

    return () => {
      mounted = false;
      // cleanup listeners (not strictly required on Image(), but good practice)
      img.onload = null;
      img.onerror = null;
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [hiResSrc]);

  /* ---------- block native pinch-to-zoom while overlay open ---------- */
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
      document.removeEventListener("touchstart", preventPinch);
      document.removeEventListener("touchmove", preventPinch);
      document.removeEventListener("gesturestart", preventGesture);
    };
  }, [open]);

  /* ---------- prevent Ctrl/Cmd + wheel page zoom (capture) ---------- */
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

  /* ---------- ESC to close ---------- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- DOM transform writer (batched rAF) ---------- */
  const writeTransform = useCallback(() => {
    if (!ivImageRef.current) return;
    const s = currentScale.current;
    const t = currentTranslate.current;
    ivImageRef.current.style.transform = `translate(${t.x}px, ${t.y}px) scale(${s})`;
    // keep UI scale display updated (debounced-ish): update state every 80ms max
    // we throttle: cancel previous set and schedule quick update
    if (raf.current) {
      // already scheduled UI update
    } else {
      raf.current = requestAnimationFrame(() => {
        setUiScale(currentScale.current);
        raf.current = null;
      });
    }
  }, []);

  /* ---------- wheel zoom (overlay) - exponential for fast jumps */
  function onWheel(e) {
    if (!open) return;
    e.preventDefault();

    const delta = -e.deltaY || 0;
    // exponential growth: tweak divisor for sensitivity
    const zoomExp = Math.exp(delta / 300);
    const next = clamp(currentScale.current * zoomExp, MIN_SCALE, MAX_SCALE);

    // compute zoom focal using viewer rect
    const rect = viewerRef.current?.getBoundingClientRect();
    if (!rect) {
      currentScale.current = next;
      writeTransform();
      return;
    }

    const cx =
      e.clientX - rect.left - rect.width / 2 - currentTranslate.current.x;
    const cy =
      e.clientY - rect.top - rect.height / 2 - currentTranslate.current.y;
    const ratio = next / currentScale.current;
    const nx = currentTranslate.current.x - cx * (ratio - 1);
    const ny = currentTranslate.current.y - cy * (ratio - 1);

    const limited = constrainTranslate(nx, ny, next);
    currentScale.current = next;
    currentTranslate.current = limited;
    writeTransform();
  }

  /* ---------- pointer handlers for overlay (pan & pinch) ---------- */
  function onPointerDown(e) {
    try {
      e.target.setPointerCapture?.(e.pointerId);
    } catch {
      /*error*/
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // cancel any running momentum
    if (momentumRaf.current) {
      cancelAnimationFrame(momentumRaf.current);
      momentumRaf.current = null;
      velocity.current = { x: 0, y: 0 };
    }

    if (pointers.current.size === 1) {
      startPan.current = {
        x: e.clientX - currentTranslate.current.x,
        y: e.clientY - currentTranslate.current.y,
      };
      isPanning.current = true;
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

    if (pointers.current.size === 1 && isPanning.current && startPan.current) {
      const nx = e.clientX - startPan.current.x;
      const ny = e.clientY - startPan.current.y;
      const limited = constrainTranslate(nx, ny, currentScale.current);
      currentTranslate.current = limited;
      // velocity for momentum
      const now = performance.now();
      const dt = Math.max(1, now - lastMove.current.t);
      const vx = (e.clientX - lastMove.current.x) / dt;
      const vy = (e.clientY - lastMove.current.y) / dt;
      velocity.current = { x: vx, y: vy };
      lastMove.current = { t: now, x: e.clientX, y: e.clientY };

      writeTransform();
    } else if (pointers.current.size === 2) {
      const arr = Array.from(pointers.current.values());
      const d = distance(arr[0], arr[1]);
      if (lastPinch.current && Math.abs(d - lastPinch.current) > 2) {
        const ratio = d / lastPinch.current;
        const nextScale = clamp(
          currentScale.current * ratio,
          MIN_SCALE,
          MAX_SCALE
        );

        const rect = viewerRef.current?.getBoundingClientRect();
        if (!rect) {
          currentScale.current = nextScale;
          writeTransform();
          lastPinch.current = d;
          return;
        }

        const centerX =
          (arr[0].x + arr[1].x) / 2 -
          rect.left -
          rect.width / 2 -
          currentTranslate.current.x;
        const centerY =
          (arr[0].y + arr[1].y) / 2 -
          rect.top -
          rect.height / 2 -
          currentTranslate.current.y;
        const ratio2 = nextScale / currentScale.current;
        const nx = currentTranslate.current.x - centerX * (ratio2 - 1);
        const ny = currentTranslate.current.y - centerY * (ratio2 - 1);

        const limited = constrainTranslate(nx, ny, nextScale);
        currentScale.current = nextScale;
        currentTranslate.current = limited;
        writeTransform();
        lastPinch.current = d;
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
      const dx = vx * dt * 20; // scale velocity to visible px movement (tweak)
      const dy = vy * dt * 20;
      const nextTx = currentTranslate.current.x + dx;
      const nextTy = currentTranslate.current.y + dy;
      const limited = constrainTranslate(nextTx, nextTy, currentScale.current);

      if (limited.x !== nextTx) vx *= 0.6;
      if (limited.y !== nextTy) vy *= 0.6;

      currentTranslate.current = limited;
      writeTransform();

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
      isPanning.current = false;
      startPan.current = null;
      lastPinch.current = null;
      if (Math.hypot(velocity.current.x, velocity.current.y) > 0.002) {
        startMomentum();
      }
      // sync UI scale now
      setUiScale(currentScale.current);
    }
  }

  /* ---------- preview sticky-frame pinch opens overlay seeded ---------- */
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
        // open overlay AND seed scale+translate for natural feel
        setOpen(true);
        // choose hi-res if available (preload started earlier)
        if (hiResSrc && !hiResLoaded) {
          // let preload finish quickly (hiResLoaded true when done)
        }
        const initialScale = clamp(
          INITIAL_SCALE * ratio * 1.2,
          MIN_SCALE,
          MAX_SCALE
        );
        // seed translate toward pinch center
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
        currentScale.current = initialScale;
        currentTranslate.current = limited;
        writeTransform();
        setUiScale(currentScale.current);
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

  /* ---------- double-tap toggles around pointer -> we handle transform directly ---------- */
  const lastClick = useRef(0);
  function onDoubleClick(e) {
    const now = Date.now();
    if (now - lastClick.current < 350) {
      const rect = viewerRef.current?.getBoundingClientRect();
      const clientX = e?.clientX ?? window.innerWidth / 2;
      const clientY = e?.clientY ?? window.innerHeight / 2;
      const targetScale =
        currentScale.current > INITIAL_SCALE * 1.15
          ? INITIAL_SCALE
          : clamp(currentScale.current * 2, MIN_SCALE, MAX_SCALE);

      if (rect) {
        const cx =
          clientX - rect.left - rect.width / 2 - currentTranslate.current.x;
        const cy =
          clientY - rect.top - rect.height / 2 - currentTranslate.current.y;
        const ratio = targetScale / currentScale.current;
        const nx = currentTranslate.current.x - cx * (ratio - 1);
        const ny = currentTranslate.current.y - cy * (ratio - 1);
        const limited = constrainTranslate(nx, ny, targetScale);
        currentScale.current = targetScale;
        currentTranslate.current = limited;
        writeTransform();
        setUiScale(currentScale.current);
      } else {
        currentScale.current = targetScale;
        writeTransform();
        setUiScale(currentScale.current);
      }
      lastClick.current = 0;
    } else {
      lastClick.current = now;
    }
  }

  function preventDrag(e) {
    e.preventDefault();
  }

  /* ---------- Actions ---------- */
  function onClose() {
    setOpen(false);
    // reset transform after overlay close (small delay)
    requestAnimationFrame(() => {
      currentScale.current = INITIAL_SCALE;
      currentTranslate.current = { x: 0, y: 0 };
      setUiScale(INITIAL_SCALE);
      if (ivImageRef.current)
        ivImageRef.current.style.transform = `translate(0px,0px) scale(${INITIAL_SCALE})`;
    });
  }
  function onMinimize() {
    currentScale.current = INITIAL_SCALE;
    currentTranslate.current = { x: 0, y: 0 };
    writeTransform();
    setUiScale(INITIAL_SCALE);
    setOpen(false);
  }
  function onZoomMax() {
    const next = clamp(currentScale.current * 1.5, MIN_SCALE, MAX_SCALE);
    currentScale.current = next;
    writeTransform();
    setUiScale(next);
  }

  /* ---------- slider value derived from current scale (for controlled input) ---------- */
  const sliderValue = scaleToSlider(uiScale);

  /* ---------- when overlay open: ensure overlay image uses hiResSrc (if loaded) to avoid pixelation.
       We set src directly on the DOM image to avoid React re-render penalty.
  ---------- */
  useEffect(() => {
    if (!ivImageRef.current) return;
    const imgEl = ivImageRef.current;
    const target = hiResSrc && hiResLoaded ? hiResSrc : src;
    if (imgEl.src !== target) {
      // swap smoothly: keep current image visible until new is available, then swap
      const tmp = new Image();
      tmp.src = target;
      tmp.onload = () => {
        imgEl.src = target;
        imgEl.style.opacity = "1";
      };
      tmp.onerror = () => {
        // fallback keep current
      };
    }
  }, [open, hiResLoaded, hiResSrc, src]);

  /* ---------- write initial transform when overlay opens ---------- */
  useEffect(() => {
    if (open) {
      // make sure UI shows initial scale
      setUiScale(currentScale.current);
      // small rAF to ensure DOM available
      requestAnimationFrame(() => writeTransform());
    }
  }, [open, writeTransform]);

  /* ---------- cleanup rafs on unmount ---------- */
  useEffect(() => {
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      if (momentumRaf.current) cancelAnimationFrame(momentumRaf.current);
    };
  }, []);

  /* ---------- Render ---------- */
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
            src={src}
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
                currentScale.current = INITIAL_SCALE;
                currentTranslate.current = { x: 0, y: 0 };
                setUiScale(INITIAL_SCALE);
                // Ensure hiRes preload is used if available (see effect).
              }}
              type="button"
            />
          </div>
        </div>
      </aside>

      {/* Overlay */}
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
              <div className="zoom-display">{Math.round(uiScale * 100)}%</div>

              <button
                className="iv-btn"
                onClick={() => {
                  currentScale.current = INITIAL_SCALE;
                  currentTranslate.current = { x: 0, y: 0 };
                  writeTransform();
                  setUiScale(INITIAL_SCALE);
                }}
              >
                Fit
              </button>

              <button
                className="iv-btn"
                onClick={() => {
                  const n = clamp(
                    currentScale.current * 1.25,
                    MIN_SCALE,
                    MAX_SCALE
                  );
                  currentScale.current = n;
                  writeTransform();
                  setUiScale(n);
                }}
              >
                +
              </button>

              <button
                className="iv-btn"
                onClick={() => {
                  const n = clamp(
                    currentScale.current / 1.25,
                    MIN_SCALE,
                    MAX_SCALE
                  );
                  currentScale.current = n;
                  writeTransform();
                  setUiScale(n);
                }}
              >
                −
              </button>

              {/* Slider (log scale) */}
              <div className="zoom-slider">
                <button
                  className="slide-icon"
                  onClick={() => {
                    const cur = scaleToSlider(uiScale);
                    const next = Math.max(0, cur - 6);
                    const s = sliderToScale(next);
                    currentScale.current = s;
                    writeTransform();
                    setUiScale(s);
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
                  value={sliderValue}
                  onChange={(ev) => {
                    const v = Number(ev.target.value);
                    const s = sliderToScale(v);
                    currentScale.current = s;
                    writeTransform();
                    setUiScale(s);
                  }}
                />

                <button
                  className="slide-icon"
                  onClick={() => {
                    const cur = scaleToSlider(uiScale);
                    const next = Math.min(100, cur + 6);
                    const s = sliderToScale(next);
                    currentScale.current = s;
                    writeTransform();
                    setUiScale(s);
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div
            className="iv-body"
            style={{
              background: "#111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* image element used for transformation. Initially src will be preview; effect swaps to hiRes when available */}
            <img
              ref={ivImageRef}
              src={hiResSrc && hiResLoaded ? hiResSrc : src}
              alt={alt}
              draggable={false}
              onDragStart={preventDrag}
              style={{
                transition: open
                  ? "transform 100ms cubic-bezier(.2,.9,.2,1), opacity 180ms linear"
                  : "none",
                willChange: "transform, opacity",
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                opacity: 1,
                touchAction: "none",
                userSelect: "none",
              }}
              className="iv-image"
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
}
