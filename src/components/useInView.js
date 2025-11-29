// src/components/useInView.js
import { useEffect, useRef, useState } from "react";

export default function useInView({ threshold = 0.1, root = null, once = true } = {}) {
  const domRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = domRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { root, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, root, once]);

  return { domRef, isVisible };
}
