// src/pages/AboutMePage.jsx

import AboutMeHeader from "../components/AboutMeHeader";

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
                src="https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/about-me-profile.jpeg"
                alt="profile"
              />
            </div>

            <div className="about-card__content">
              <h1 className="about-name">Kunal Rastogi</h1>

              <p className="about-desc">
                Highly skilled and accomplished Senior Visual Designer with a
                passion for creating exceptional brand experiences. With +6
                years of experience in the (D2C) industry and a successful
                freelance career working with diverse brands, I bring a unique
                blend of creativity, leadership, and expertise to every project.
                Known for mentoring and guiding teams to achieve their full
                potential, I am now seeking a challenging role as a Design
                Manager to contribute to the success of an organization.
              </p>
            </div>
          </div>
          <div className="about-skills">
            <article className="skill-card">
              <h4>Art Direction</h4>
              <p>Highly skilled and accomplished Senior Visual Designer.</p>
            </article>

            <article className="skill-card">
              <h4>Web Design</h4>
              <p>Highly skilled and accomplished Senior Visual Designer.</p>
            </article>

            <article className="skill-card">
              <h4>Campaigns</h4>
              <p>Highly skilled and accomplished Senior Visual Designer.</p>
            </article>

            <article className="skill-card">
              <h4>Branding</h4>
              <p>Highly skilled and accomplished Senior Visual Designer.</p>
            </article>
          </div>
          <div className="about-brands marquee">
            <div className="marquee-track">
              {/* ORIGINAL SET */}
              <article className="brand-card">
                <img
                  src="https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/arata-1.png"
                  alt="Arata"
                />
              </article>
              <article className="brand-card">
                <img
                  src="https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/bannstudio-1.png"
                  alt="Bann Studio"
                />
              </article>
              <article className="brand-card">
                <img
                  src="https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/bombay_shaving_company-1.png"
                  alt="Bombay Shaving Company"
                />
              </article>
              <article className="brand-card">
                <img
                  src="https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/huft-1.png"
                  alt="Heads Up For Tails"
                />
              </article>
              <article className="brand-card">
                <img
                  src="https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/pilgrim-1.png"
                  alt="Pilgrim"
                />
              </article>
              <article className="brand-card">
                <img
                  src="https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/suhaag.png"
                  alt="Suhaag"
                />
              </article>

              {/* DUPLICATE SET FOR INFINITE LOOP */}
              <article className="brand-card">
                <img
                  src="https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/arata-1.png"
                  alt="Arata"
                />
              </article>
              <article className="brand-card">
                <img
                  src="https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/bannstudio-1.png"
                  alt="Bann Studio"
                />
              </article>
              <article className="brand-card">
                <img
                  src="https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/bombay_shaving_company-1.png"
                  alt="Bombay Shaving Company"
                />
              </article>
              <article className="brand-card">
                <img
                  src="https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/huft-1.png"
                  alt="Heads Up For Tails"
                />
              </article>
              <article className="brand-card">
                <img
                  src="https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/pilgrim-1.png"
                  alt="Pilgrim"
                />
              </article>
              <article className="brand-card">
                <img
                  src="https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/suhaag.png"
                  alt="Suhaag"
                />
              </article>
            </div>
          </div>

          <div className="about-handles">
            <a href="">
              <img
                src="https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/linkedin.svg"
                alt="Bann Studio"
              />
            </a>
            <a href="">
              <img
                src="https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/resume.svg"
                alt="Arata"
              />
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
