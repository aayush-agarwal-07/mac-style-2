// src/components/AboutMeHeader.jsx
import { Link } from "react-router-dom";

import "./../styles/layout.css";

export default function AboutMeHeader() {
  return (
    <header className="site-header">
      <Link to="/" className="brand">
        Home
      </Link>

      <nav>
        <Link to="/projects" className="projects">
          Projects
        </Link>
      </nav>
    </header>
  );
}
