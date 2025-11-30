// src/components/AboutMeHeader.jsx
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./../styles/layout.css";

export default function AboutMeHeader() {
  const [isMsite, setIsMsite] = useState(() => {
    if (typeof window === "undefined") return false;

    const narrow = window.matchMedia("(max-width: 769px)").matches;
    const touch = window.matchMedia("(pointer: coarse)").matches;

    return narrow || touch;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mqNarrow = window.matchMedia("(max-width: 769px)");
    const mqTouch = window.matchMedia("(pointer: coarse)");

    const update = () => {
      setIsMsite(mqNarrow.matches || mqTouch.matches);
    };

    // add listeners (new API + fallback)
    mqNarrow.addEventListener?.("change", update);
    mqTouch.addEventListener?.("change", update);
    mqNarrow.addListener?.(update);
    mqTouch.addListener?.(update);

    return () => {
      mqNarrow.removeEventListener?.("change", update);
      mqTouch.removeEventListener?.("change", update);
      mqNarrow.removeListener?.(update);
      mqTouch.removeListener?.(update);
    };
  }, []);

  return (
    <header className="site-header">
      <Link to="/" className="brand">
        {isMsite ? "Home" : "Kunal Rastogi"}
      </Link>

      <nav>
        <Link to="/projects" className="projects">
          Projects
        </Link>
      </nav>
    </header>
  );
}
