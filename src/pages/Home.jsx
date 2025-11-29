// src/pages/Home.jsx

import HeroCta from "../components/HeroCta";
import Header from "./Header";

export default function Home() {
  return (
    <>
      <main className="home">
        {/* <h2 className="header">My Work</h2> */}
        <Header />
        <HeroCta />
      </main>
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
              passion for creating exceptional brand experiences. With +6 years
              of experience in the (D2C) industry and a successful freelance
              career working with diverse brands, I bring a unique blend of
              creativity, leadership, and expertise to every project. Known for
              mentoring and guiding teams to achieve their full potential, I am
              now seeking a challenging role as a Design Manager to contribute
              to the success of an organization.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
