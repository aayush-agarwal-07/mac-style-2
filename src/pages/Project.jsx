// src/pages/Project.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import projects from "../data/projects";
import "../styles/layout.css";

export default function Project() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const stickyRef = useRef(null);
  const imgRef = useRef(null);
  const rafRef = useRef(null);

  // find current project and its index (fallback to first)
  const { project, index } = useMemo(() => {
    const idx = projects.findIndex((p) => p.slug === slug);
    const i = idx === -1 ? 0 : idx;
    return { project: projects[i], index: i };
  }, [slug]);

  // Prev / Next helpers
  const prev = index > 0 ? projects[index - 1] : null;
  const next = index < projects.length - 1 ? projects[index + 1] : null;

  // Dynamic info panel
  const [activeInfo, setActiveInfo] = useState(null);

  /* -------------------------
     Reveal intersection observer
     ------------------------- */
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".doc-section"));
    if (!els.length || typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("visible"));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [slug]);

  /* -------------------------
     Left-image scroll -> activeInfo
     ------------------------- */
  useEffect(() => {
    const frame = stickyRef.current;
    if (!frame || !project?.infoPoints) return;

    function updatePercent() {
      const scrollTop = frame.scrollTop;
      const scrollHeight = Math.max(1, frame.scrollHeight - frame.clientHeight);
      const percent = Math.round((scrollTop / scrollHeight) * 100);

      // pick last infoPoint <= percent
      const pts = project.infoPoints || [];
      let active = null;
      for (const p of pts) {
        if (percent >= p.percent) active = p;
        else break;
      }
      setActiveInfo(active);
      rafRef.current = null;
    }

    function onScroll() {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(updatePercent);
    }

    // attach
    frame.addEventListener("scroll", onScroll, { passive: true });
    // initial call
    updatePercent();

    return () => {
      frame.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [project, slug]); // re-run when project/slug changes

  /* -------------------------
     Navigation helpers
     ------------------------- */
  function goToProject(slugTo) {
    navigate(`/projects/${slugTo}`);
    // focus right column after navigation (small timeout)
    setTimeout(() => {
      const el = document.querySelector(".project-right");
      if (el) el.focus();
    }, 60);
  }

  // const [isMsite, setIsMsite] = useState(() => {
  //   if (typeof window === "undefined") return false;

  //   const narrow = window.matchMedia("(max-width: 769px)").matches;
  //   const touch = window.matchMedia("(pointer: coarse)").matches;

  //   return narrow || touch;
  // });

  // useEffect(() => {
  //   if (typeof window === "undefined") return;

  //   const mqNarrow = window.matchMedia("(max-width: 769px)");
  //   const mqTouch = window.matchMedia("(pointer: coarse)");

  //   const update = () => {
  //     setIsMsite(mqNarrow.matches || mqTouch.matches);
  //   };


  //   mqNarrow.addEventListener?.("change", update);
  //   mqTouch.addEventListener?.("change", update);
  //   mqNarrow.addListener?.(update);
  //   mqTouch.addListener?.(update);

  //   return () => {
  //     mqNarrow.removeEventListener?.("change", update);
  //     mqTouch.removeEventListener?.("change", update);
  //     mqNarrow.removeListener?.(update);
  //     mqTouch.removeListener?.(update);
  //   };
  // }, []);

 
  return (
    <>
      <header className="site-header">
        <Link to="/projects" className="projects">
          Projects
        </Link>

        <nav>
          <Link to="/" className="brand">
            Home
          </Link>
        </nav>
      </header>
      <main className="project-container" aria-live="polite">
        {/* Prev nav (uses functions to avoid ref issues) */}
        <nav className="project-nav" aria-label="Project navigation">
          {prev && (
            <button
              className="nav-link prev"
              onClick={() => goToProject(prev.slug)}
            >
              ← {prev.title}
            </button>
          )}
        </nav>
        {/* LEFT */}
        <aside className="project-left" aria-label={`${project.title} visuals`}>
          {/* <div className="left-actions">
            <Link to="/projects" className="back-link">
              Projects
            </Link>
          </div> */}

          <div
            className="sticky-frame"
            ref={stickyRef}
            role="region"
            aria-label={`${project.title} image preview`}
          >
            <img
              ref={imgRef}
              src={project.hero}
              alt={`${project.title} visual`}
              className="left-long-image interactive-image"
            />
          </div>
        </aside>

        {/* RIGHT */}
        <section className="project-right" tabIndex={-1}>
          <header className="project-title">
            <h1 className="project-heading">{project.title}</h1>
            {/* No subtitle variable used */}
          </header>

          <div className="project-sections">
            {project.sections && project.sections.length > 0 ? (
              project.sections.map((s, i) => (
                <article
                  key={s.id || i}
                  id={s.id || `section-${i}`}
                  className="doc-section"
                  style={{ transitionDelay: `${i * 70}ms` }}
                >
                  <h2 className="section-title">{s.title}</h2>
                  <p className="section-text">{s.text}</p>
                </article>
              ))
            ) : (
              <article className="doc-section visible">
                <h2>No content</h2>
                <p>This project does not yet have any sections.</p>
              </article>
            )}
          </div>

          {/* Dynamic info panel */}
          <div className="dynamic-info-panel" role="status" aria-live="polite">
            {activeInfo ? (
              <>
                {/* <div className="info-percent">{activeInfo.percent}%</div> */}
                <div className="info-text">{activeInfo.text}</div>
              </>
            ) : (
              <div className="info-empty">
                Scroll the left image to reveal info
              </div>
            )}
          </div>
        </section>
        {/* Next nav (uses functions to avoid ref issues) */}
        <nav className="project-nav" aria-label="Project navigation">
          {next && (
            <button
              className="nav-link next"
              onClick={() => goToProject(next.slug)}
            >
              {next.title} →
            </button>
          )}
        </nav>
      </main>
    </>
  );
}
