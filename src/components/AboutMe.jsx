import { Link } from "react-router-dom";

const AboutMe = ({
  name = "Kunal Rastogi",
  text = "Highly skilled and accomplished Senior Visual Designer with a passion for creating exceptional",
  link = "/about",
}) => {
  return (
    <section className="project-right about-me-msite">
      <header className="project-title">
        <h1 className="project-heading">{name}</h1>
      </header>

      <div className="project-sections">
        <article className="doc-section">
          <p className="section-text">
            {text}{" "}
            <Link to={link} className="more">
              more...
            </Link>
          </p>
        </article>
      </div>
    </section>
  );
};

export default AboutMe;
