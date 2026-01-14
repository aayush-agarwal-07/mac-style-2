// src/pages/Project.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import projects from "../data/projects";
import "../styles/layout.css";

import ImageAside from "../components/ImageAside";

export default function Project() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const stickyRef = useRef(null);
  // const imgRef = useRef(null);

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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 60);
    return () => clearTimeout(t);
  }, []);

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
     Scroll percent handler coming from ImageAside
     ------------------------- */
  function handleScrollPercent(percent) {
    const pts = project?.infoPoints || [];
    let active = null;
    for (const p of pts) {
      if (percent >= p.percent) active = p;
      else break;
    }
    setActiveInfo(active);
  }

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

  return (
    <>
      <header className="site-header">
        <Link to="/projects" className="projects">
          Projects
        </Link>

        <nav>
          <Link to="/about" className="brand">
            About me
          </Link>
        </nav>
      </header>
      <main
        className={`project-container ${isLoaded ? "page-loaded" : ""}`}
        aria-live="polite"
      >
        {/* <div class="universal-line"></div> */}
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

        {/* LEFT (ImageAside handles maximize / overlay / gestures)
            We pass stickyRef for backwards compatibility and
            onScrollPercent to receive scroll updates. */}
        <ImageAside
          images={project.heroes || [project.hero]}
          alt={`${project.title} visual`}
          label={`${project.title} visuals`}
          stickyRef={stickyRef}
          onScrollPercent={handleScrollPercent}
        />

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
          {/* <div className="dynamic-info-panel" role="status" aria-live="polite">
            {activeInfo ? (
              <>
                <div className="info-text">{activeInfo.text}</div>
              </>
            ) : (
              <div className="info-empty">
                Scroll the left image to reveal info
              </div>
            )}
          </div> */}
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
