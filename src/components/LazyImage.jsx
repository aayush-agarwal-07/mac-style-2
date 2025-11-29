// src/components/LazyImage.jsx
import React, { useRef, useState, useEffect } from "react";

export default function LazyImage({ src, alt, className }) {
  const imgRef = useRef();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.src = src;
          setVisible(true);
          observer.unobserve(img);
        }
      });
    }, { threshold: 0.1 });
    observer.observe(img);
    return () => observer.disconnect();
  }, [src]);

  return <img ref={imgRef} alt={alt} className={`${className} ${visible ? "loaded" : "loading"}`} />;
}
