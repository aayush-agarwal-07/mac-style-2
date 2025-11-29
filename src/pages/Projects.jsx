// src/pages/Projects.jsx

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
  return (
    <>
      <Header />
      <main className="home">
        <h2 className="page-title">My Projects</h2>

        <section className="folder-grid">
          {CATS.map((c, i) => {
            const slug = c.toLowerCase().replace(/\s+/g, "-");
            return (
              <FolderCard
                key={c}
                to={`/projects/${slug}`} // changed from /category/...
                title={c}
                delay={i * 60}
              />
            );
          })}
        </section>
        {/* RIGHT */}
        <section className="project-right about-me-msite">
          <header className="project-title">
            <h1 className="project-heading">Kunal Rastogi</h1>
            {/* No subtitle variable used */}
          </header>

          <div className="project-sections">
            <article className="doc-section">
              <p className="section-text">
                Highly skilled and accomplished Senior Visual Designer with a
                passion for creating exceptional brand experiences. With +6
                years of experience in the (D2C) industry and a successful
                freelance career working with diverse brands, I bring a unique
                blend of creativity, leadership, and expertise to every project.
                Known for mentoring and guiding teams to achieve their full
                potential, I am now seeking a challenging role as a Design
                Manager to contribute to the success of an organization.
              </p>
              {/* <p className="section-text">
                Highly skilled and accomplished Senior Visual Designer with a
                passion for creating exceptional brand experiences. With +6
                years of experience in the (D2C) industry and a successful
                freelance career working with diverse brands, I bring a unique
                blend of creativity, leadership, and expertise to every project.
                Known for mentoring and guiding teams to achieve their full
                potential, I am now seeking a challenging role as a Design
                Manager to contribute to the success of an organization.
              </p> */}
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
