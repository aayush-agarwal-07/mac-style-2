// src/components/ImageAside.jsx
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import "../styles/base.css"; // adjust if your CSS file is named differently

export default function ImageAside({
  src,
  alt = "Preview image",
  label = "Preview",
  stickyRef = null,
  onScrollPercent = null, // callback(percent)
}) {
  // Zoom: initial 1000% = scale 10
  const INITIAL_SCALE = 10;
  const MIN_SCALE = 0.1; // 10%
  const MAX_SCALE = 30; // 3000%

  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(INITIAL_SCALE);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const [isPanning, setIsPanning] = useState(false);
  const startPan = useRef(null);

  const viewerRef = useRef(null);
  const ivImageRef = useRef(null);
  const previewRef = useRef(null);
  const stickyFrameRef = useRef(null);

  const pointers = useRef(new Map());
  const lastPinch = useRef(null);
  const pointersPreview = useRef(new Map());
  const previewPinchStart = useRef(null);

  // momentum variables
  const lastMove = useRef({ t: 0, x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const momentumRaf = useRef(null);

  /* ---------- helpers ---------- */
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  // Constrain translate to avoid blank space showing
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

  /* ---------- Forward stickyRef and attach scroll listener ---------- */
  useEffect(() => {
    // expose DOM node to parent stickyRef
    if (stickyRef) {
      if (typeof stickyRef === "object")
        // eslint-disable-next-line react-hooks/immutability
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
    // initial call
    updatePercent();

    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      // cleanup external ref
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

  /* ---------- Block native pinch/zoom while overlay open ---------- */
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

  /* ---------- Prevent Ctrl/Cmd + wheel page zoom ---------- */
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

  /* ---------- ESC close ---------- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- EXponential wheel zoom (fast & smooth) ---------- */
  function onWheel(e) {
    if (!open) return;
    e.preventDefault();

    // delta direction (positive: zoom in)
    const delta = -e.deltaY || 0;

    // exponential factor: smaller denominator -> faster jumps
    // tuned for smooth navigation across large ranges
    const zoomExp = Math.exp(delta / 300); // tune divisor (300) to taste
    const next = clamp(scale * zoomExp, MIN_SCALE, MAX_SCALE);

    const rect = viewerRef.current?.getBoundingClientRect();
    if (!rect) {
      setScale(next);
      return;
    }

    // zoom towards pointer
    const cx = e.clientX - rect.left - rect.width / 2 - translate.x;
    const cy = e.clientY - rect.top - rect.height / 2 - translate.y;
    const ratio = next / scale;
    const nx = translate.x - cx * (ratio - 1);
    const ny = translate.y - cy * (ratio - 1);

    const limited = constrainTranslate(nx, ny, next);
    setScale(next);
    setTranslate(limited);
  }

  /* ---------- Overlay pointer handlers (pan + pinch) ---------- */
  function onPointerDown(e) {
    try {
      e.target.setPointerCapture?.(e.pointerId);
    } catch {
      /*error*/
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (momentumRaf.current) {
      cancelAnimationFrame(momentumRaf.current);
      momentumRaf.current = null;
      velocity.current = { x: 0, y: 0 };
    }

    if (pointers.current.size === 1) {
      // store starting pan offset relative to translate
      startPan.current = {
        x: e.clientX - translate.x,
        y: e.clientY - translate.y,
      };
      setIsPanning(true);
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

    if (pointers.current.size === 1 && isPanning && startPan.current) {
      // pan by pointer delta (smoother than re-calculating absolute sometimes)
      const nx = e.clientX - startPan.current.x;
      const ny = e.clientY - startPan.current.y;
      const limited = constrainTranslate(nx, ny, scale);
      setTranslate(limited);

      const now = performance.now();
      const dt = Math.max(1, now - lastMove.current.t);
      const vx = (e.clientX - lastMove.current.x) / dt;
      const vy = (e.clientY - lastMove.current.y) / dt;
      velocity.current = { x: vx, y: vy };
      lastMove.current = { t: now, x: e.clientX, y: e.clientY };
    } else if (pointers.current.size === 2) {
      const arr = Array.from(pointers.current.values());
      const d = distance(arr[0], arr[1]);
      if (lastPinch.current && Math.abs(d - lastPinch.current) > 2) {
        const ratio = d / lastPinch.current;
        const nextScale = clamp(scale * ratio, MIN_SCALE, MAX_SCALE);

        const rect = viewerRef.current?.getBoundingClientRect();
        if (!rect) {
          setScale(nextScale);
          lastPinch.current = d;
          return;
        }

        const centerX =
          (arr[0].x + arr[1].x) / 2 - rect.left - rect.width / 2 - translate.x;
        const centerY =
          (arr[0].y + arr[1].y) / 2 - rect.top - rect.height / 2 - translate.y;
        const ratio2 = nextScale / scale;
        const nx = translate.x - centerX * (ratio2 - 1);
        const ny = translate.y - centerY * (ratio2 - 1);

        const limited = constrainTranslate(nx, ny, nextScale);
        setScale(nextScale);
        setTranslate(limited);
        lastPinch.current = d;
      }
    }
  }

  function startMomentum() {
    const friction = 0.95;
    const minV = 0.001;
    let vx = velocity.current.x;
    let vy = velocity.current.y;

    function step() {
      const dt = 16;
      const dx = vx * dt;
      const dy = vy * dt;
      const nextTx = translate.x + dx;
      const nextTy = translate.y + dy;
      const limited = constrainTranslate(nextTx, nextTy, scale);

      if (limited.x !== nextTx) vx *= 0.6;
      if (limited.y !== nextTy) vy *= 0.6;

      setTranslate(limited);

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

    if (Math.hypot(vx, vy) > 0.002) {
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
      setIsPanning(false);
      startPan.current = null;
      lastPinch.current = null;
      if (Math.hypot(velocity.current.x, velocity.current.y) > 0.002) {
        startMomentum();
      }
    }
  }

  /* ---------- Preview pinch -> open overlay seeded ---------- */
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
        setScale(initialScale);
        setTranslate(limited);

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
    if (pointersPreview.current.size === 0) {
      previewPinchStart.current = null;
    }
  }

  /* ---------- Double-tap toggle ---------- */
  const lastClick = useRef(0);
  function onDoubleClick(e) {
    const now = Date.now();
    // detect double-click/double-tap timing
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
        setScale(targetScale);
        setTranslate(limited);
      } else {
        setScale(targetScale);
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
  }
  function onMinimize() {
    setScale(INITIAL_SCALE);
    setTranslate({ x: 0, y: 0 });
    setOpen(false);
  }
  function onZoomMax() {
    setScale((s) => clamp(s * 1.5, MIN_SCALE, MAX_SCALE));
  }

  /* ---------- UI helpers: slider (log scale) ---------- */
  const logMin = useMemo(() => Math.log(MIN_SCALE), []);
  const logMax = useMemo(() => Math.log(MAX_SCALE), []);
  const scaleToSlider = useCallback(
    (s) => {
      // map scale to 0..100
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

  // slider value derived from scale
  const sliderValue = scaleToSlider(scale);

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
          />

          <button
            className="mac-maximize maximize-btn"
            title="Open preview"
            aria-label="Open preview"
            onClick={() => {
              setOpen(true);
              // ensure initial zoom/focus when opened manually
              setScale(INITIAL_SCALE);
              setTranslate({ x: 0, y: 0 });
              //    type="button"
            }}
          ></button>
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
              <div className="zoom-display">{Math.round(scale * 100)}%</div>

              <button
                className="iv-btn"
                onClick={() => {
                  setScale(INITIAL_SCALE);
                  setTranslate({ x: 0, y: 0 });
                }}
              >
                Fit
              </button>

              <button
                className="iv-btn"
                onClick={() => {
                  setScale((s) => clamp(s * 1.25, MIN_SCALE, MAX_SCALE));
                }}
              >
                +
              </button>

              <button
                className="iv-btn"
                onClick={() => {
                  setScale((s) => clamp(s / 1.25, MIN_SCALE, MAX_SCALE));
                }}
              >
                −
              </button>

              {/* Slider */}
              <div className="zoom-slider">
                <button
                  className="slide-icon"
                  onClick={() => {
                    // step down a bit (logarithmic step)
                    const cur = scaleToSlider(scale);
                    const next = Math.max(0, cur - 6);
                    setScale(sliderToScale(next));
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
                    setScale(sliderToScale(v));
                  }}
                />

                <button
                  className="slide-icon"
                  onClick={() => {
                    const cur = scaleToSlider(scale);
                    const next = Math.min(100, cur + 6);
                    setScale(sliderToScale(next));
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
              src={src}
              alt={alt}
              draggable={false}
              onDragStart={preventDrag}
              style={{
                transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                touchAction: "none",
                transition: open
                  ? "transform 100ms cubic-bezier(.2,.9,.2,1)"
                  : "none",
                willChange: "transform",
                maxWidth: "100%",
                maxHeight: "100%",
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
