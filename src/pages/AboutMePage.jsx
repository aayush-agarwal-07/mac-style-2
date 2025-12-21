// src/pages/AboutMePage.jsx

import AboutMeHeader from "../components/AboutMeHeader";
import BrandsMarquee from "../components/BrandsMarquee";

export default function AboutMePage() {
  return (
    <>
      <main className="home">
        <AboutMeHeader />
        <div className="about-sheet__card">
          <div className="about-card">
            <div className="about-card__meta">
              <img
                className="about-avatar"
                src="https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/kunal-rastogi.jpeg"
                alt="profile"
              />
            </div>

            <div className="about-card__content">
              <h1 className="about-name">Kunal Rastogi</h1>

              <p className="about-desc">
                Highly skilled Senior Visual Designer and Design Lead with 6+
                years of experience building scalable, high-impact brand systems
                across the D2C ecosystem. I specialise in translating brand
                strategy into compelling visual narratives across campaigns,
                websites, marketplaces, and product launches. With a strong
                foundation in art direction, digital design, and performance-led
                creatives, I’ve led cross-functional collaborations with growth,
                product, and marketing teams to deliver cohesive brand
                experiences at scale. My work spans web design, campaigns,
                motion graphics, packaging, and marketplace ecosystems, with a
                sharp focus on both aesthetics and business outcomes. Known for
                mentoring designers, elevating team output, and setting strong
                visual direction, I am now focused on growing into a Design
                Manager role where I can drive creative vision, systems, and
                people development to build enduring brands.
              </p>
            </div>
          </div>
          <div className="about-skills">
            <article className="skill-card">
              <h4>Art Direction</h4>
              <p>Shaping visual narratives across campaigns, shoots, and launches with clarity, taste, and consistency.</p>
            </article>

            <article className="skill-card">
              <h4>Web Design</h4>
              <p>Designing high-impact web experiences that balance brand, usability, and conversion.</p>
            </article>

            <article className="skill-card">
              <h4>Campaigns</h4>
              <p>Concept-driven campaigns built to scale across platforms and perform.</p>
            </article>

            <article className="skill-card">
              <h4>Branding</h4>
              <p>Building flexible brand systems that stay consistent while evolving with growth.</p>
            </article>
          </div>
          <BrandsMarquee />
        </div>
        <div className="about-handles">
          <a href="https://www.linkedin.com/in/kunal-rastogi-05495b188/">
            <img
              src="https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/linkedin.svg"
              alt="Bann Studio"
            />
          </a>
          <a href="https://drive.google.com/file/d/1K6weZQE5Z6metrIMhP-7Kg1m8x1wEPrR/view">
            <img
              src="https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/resume.svg"
              alt="Arata"
            />
          </a>
        </div>
      </main>
    </>
  );
}
