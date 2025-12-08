// src/components/ImageAside.jsx
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import "../styles/base.css";

export default function ImageAside({
  src,
  alt = "Preview image",
  label = "Preview",
  stickyRef = null,
  onScrollPercent = null,
  hiResSrc = null, // Add hi-res image prop
}) {
  const INITIAL_SCALE = 1;
  const MIN_SCALE = 1;
  const MAX_SCALE = 20;

  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(INITIAL_SCALE);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [isPanning, setIsPanning] = useState(false);
  const startPan = useRef(null);
  const isZoomingRef = useRef(false);
  const zoomTimeoutRef = useRef(null);

  const viewerRef = useRef(null);
  const ivImageRef = useRef(null);
  const previewRef = useRef(null);
  const stickyFrameRef = useRef(null);

  const pointers = useRef(new Map());
  const lastPinch = useRef(null);
  const pointersPreview = useRef(new Map());
  const previewPinchStart = useRef(null);

  const lastMove = useRef({ t: 0, x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const momentumRaf = useRef(null);

  /* ---------- helpers ---------- */
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  // Determine which image to use based on zoom
  const getImageSource = useCallback(() => {
    if (hiResSrc && scale > 3) {
      return hiResSrc;
    }
    return src;
  }, [src, hiResSrc, scale]);

  const actualSrc = getImageSource();

  // Constrain translate
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

  /* ---------- Preload hi-res image ---------- */
  useEffect(() => {
    if (!hiResSrc) return;

    let mounted = true;
    const img = new Image();

    img.onload = () => {
      if (mounted) {
        // Image preloaded successfully
      }
    };

    img.onerror = () => {
      if (mounted) {
        console.warn("Failed to preload hi-res image");
      }
    };

    img.src = hiResSrc;

    return () => {
      mounted = false;
      img.onload = null;
      img.onerror = null;
    };
  }, [hiResSrc]);

  /* ---------- Forward stickyRef ---------- */
  useEffect(() => {
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

  /* ---------- Block native pinch/zoom ---------- */
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

  /* ---------- EXponential wheel zoom ---------- */
  function onWheel(e) {
    if (!open) return;
    e.preventDefault();

    isZoomingRef.current = true;

    const delta = -e.deltaY || 0;
    const zoomExp = Math.exp(delta / 500);
    const next = clamp(scale * zoomExp, MIN_SCALE, MAX_SCALE);

    const rect = viewerRef.current?.getBoundingClientRect();
    if (!rect) {
      setScale(next);
      setTimeout(() => {
        isZoomingRef.current = false;
      }, 100);
      return;
    }

    const cx = e.clientX - rect.left - rect.width / 2 - translate.x;
    const cy = e.clientY - rect.top - rect.height / 2 - translate.y;
    const ratio = next / scale;
    const nx = translate.x - cx * (ratio - 1);
    const ny = translate.y - cy * (ratio - 1);

    const limited = constrainTranslate(nx, ny, next);

    setScale(next);
    setTranslate(limited);

    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current);
    }

    zoomTimeoutRef.current = setTimeout(() => {
      isZoomingRef.current = false;
    }, 100);
  }

  /* ---------- Overlay pointer handlers ---------- */
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
      isZoomingRef.current = true;

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
        isZoomingRef.current = false;
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
      isZoomingRef.current = false;

      if (Math.hypot(velocity.current.x, velocity.current.y) > 0.002) {
        startMomentum();
      }
    }
  }

  /* ---------- Preview pinch -> open overlay ---------- */
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

  const sliderValue = scaleToSlider(scale);

  /* ---------- Cleanup ---------- */
  useEffect(() => {
    return () => {
      if (momentumRaf.current) cancelAnimationFrame(momentumRaf.current);
      if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
    };
  }, []);

  /* ---------- Render ---------- */
  return (
    <>
      <aside className="project-left" aria-label={label}>
        <button
          className="mac-maximize maximize-btn"
          title="Open preview"
          aria-label="Open preview"
          onClick={() => {
            setOpen(true);
            setScale(INITIAL_SCALE);
            setTranslate({ x: 0, y: 0 });
          }}
        ></button>
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
              {/* <button
                aria-label="minimize"
                className="mac mac-min"
                onClick={onMinimize}
              />
              <button
                aria-label="zoom"
                className="mac mac-zoom"
                onClick={onZoomMax}
              /> */}
            </div>

            <div className="iv-title">Preview</div>

            <div className="iv-actions">
              <div className="zoom-display">{Math.round(scale * 10)}%</div>

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

              <div className="zoom-slider">
                <button
                  className="slide-icon"
                  onClick={() => {
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
              src={actualSrc}
              alt={alt}
              draggable={false}
              onDragStart={preventDrag}
              onLoad={() => {
                setImageLoaded(true);
                setImageError(false);
              }}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
              style={{
                transform: `translate3d(${translate.x}px, ${translate.y}px, 0) scale(${scale})`,
                touchAction: "none",
                transition:
                  isPanning || momentumRaf.current || isZoomingRef.current
                    ? "none"
                    : "transform 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                willChange: "transform",
                maxWidth: "100%",
                maxHeight: "100%",
                imageRendering: scale > 3 ? "crisp-edges" : "auto",
                opacity: imageLoaded ? 1 : 0.5,
                filter: imageError
                  ? "none"
                  : imageLoaded
                  ? "none"
                  : "blur(5px)",
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
