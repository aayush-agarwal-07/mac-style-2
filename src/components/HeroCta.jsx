import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./../styles/layout.css";

const ASSET_PATHS = {
  poster:
    "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/initial-png.png",
  hoverEnd:
    "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/final-png-1.png",
  forwardGif:
    "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/initial-motion.gif",
  reverseGif:
    "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/final-motion.gif",
};

// durations (ms) must match your GIF lengths
const DURATIONS = {
  forward: 1000,
  reverse: 1000,
};

const LandingControlledGif = () => {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [mode, setMode] = useState("poster");

  // keeps track of the currently scheduled timeout so we can cancel it
  const timeoutRef = useRef(null);

  const handlePointerEnter = () => {
    if (containerRef.current) {
      gsap.to(containerRef.current, { scale: 1, duration: 0.25 });
    }
    setMode("forward");
  };

  const handlePointerLeave = () => {
    if (containerRef.current) {
      gsap.to(containerRef.current, { scale: 1, duration: 0.25 });
    }
    setMode("reverse");
  };

  const handleClick = () => {
    window.location.href = "/projects";
  };

  useEffect(() => {
    if (!imgRef.current) return;

    // 🚫 kill any previous scheduled transition to avoid jitter
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (mode === "poster") {
      imgRef.current.src = ASSET_PATHS.poster;
      return;
    }

    if (mode === "forward") {
      // restart forward GIF
      imgRef.current.src = `${ASSET_PATHS.forwardGif}?t=${Date.now()}`;

      timeoutRef.current = setTimeout(() => {
        if (!imgRef.current) return;
        imgRef.current.src = ASSET_PATHS.hoverEnd;
      }, DURATIONS.forward);
    }

    if (mode === "reverse") {
      // restart reverse GIF
      imgRef.current.src = `${ASSET_PATHS.reverseGif}?t=${Date.now()}`;

      timeoutRef.current = setTimeout(() => {
        if (!imgRef.current) return;
        imgRef.current.src = ASSET_PATHS.poster;
      }, DURATIONS.reverse);
    }
  }, [mode]);

  // Initial fade-in
  useEffect(() => {
    if (imgRef.current) {
      imgRef.current.src = ASSET_PATHS.poster;
      gsap.fromTo(
        imgRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }

    // cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <main className="landing-main">
      <div ref={containerRef} className="landing-container">
        <div
          role="button"
          aria-label="Open portfolio"
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onClick={handleClick}
          className="landing-clickable"
          tabIndex={0}
        >
          <img
            ref={imgRef}
            className="landing-image"
            alt="Portfolio animation"
            draggable={false}
          />
        </div>
        {/* <div className="landing-caption">Click to open</div> */}
      </div>
    </main>
  );
};

export default LandingControlledGif;
