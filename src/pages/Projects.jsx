// src/pages/Projects.jsx

import FolderCard from "../components/FolderCard";

const CATS = [
  "First", "Second", "Third", "Fourth",
  "Fifth", "Sixth", "Seventh", "Eighth"
];

export default function Projects() {
  return (
    <>


      <main className="home">
        <h2 className="page-title">My Work</h2>

        <section className="folder-grid">
          {CATS.map((c, i) => {
            const slug = c.toLowerCase().replace(/\s+/g, "-");
            return (
              <FolderCard
                key={c}
                to={`/projects/${slug}`}   // changed from /category/...
                title={c}
                delay={i * 60}
              />
            );
          })}
        </section>
      </main>
    </>
  );
}
