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
                Senior Visual Designer and Design Lead with 6+ years of experience building scalable brand systems across the D2C ecosystem. I specialise in translating brand strategy into clear, effective visual design across campaigns, websites, marketplaces, and product launches, working closely with product, growth, and marketing teams. My work spans web design, campaigns, motion, packaging, and marketplace content, with a strong focus on balancing aesthetics and business impact. I also bring experience in mentoring designers and setting visual direction, and I’m focused on growing into a Design Manager role to lead creative systems, teams, and long-term brand vision.
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
            <article className="skill-card">
              <h4>Packaging</h4>
              <p>Creating scalable packaging systems that balance impact, clarity, and consistency across formats.</p>
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
