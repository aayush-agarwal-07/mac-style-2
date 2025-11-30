// src/pages/Projects.jsx

import { useEffect, useState } from "react";
import AboutMe from "../components/AboutMe";
import FolderCard from "../components/FolderCard";
import Header from "./Header";

const CATS = [
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth",
];

export default function Projects() {
  // auto-detect msite by viewport width (adjust breakpoint if you want)
  const [isMsite, setIsMsite] = useState(() => {
    if (typeof window === "undefined") return false; // SSR-safe default
    return window.matchMedia("(max-width: 769px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 769px)");
    const onChange = (e) => setIsMsite(e.matches);

    // modern API preferred, fallback for older browsers
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  return (
    <>
      <Header />
      <main className="home">
        <h2 className="page-title">My Projects</h2>

        <section className="folder-grid">
          {CATS.map((c, i) => {
            const slug = c.toLowerCase().replace(/\s+/g, "-");

            // only pass delay on non-msite (desktop)
            const props = {
              key: c,
              to: `/projects/${slug}`,
              title: c,
            };
            if (!isMsite) props.delay = i * 60;

            return <FolderCard {...props} />;
          })}
        </section>

        <AboutMe />
      </main>
    </>
  );
}
