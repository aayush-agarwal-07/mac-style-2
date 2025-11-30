// src/pages/Projects.jsx

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
        <AboutMe />
      </main>
    </>
  );
}
