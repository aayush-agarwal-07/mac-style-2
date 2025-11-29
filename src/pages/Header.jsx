// src/components/Header.jsx
import { Link } from "react-router-dom";
import "./../styles/layout.css";

export default function Header() {
  return (
    <header className="site-header">
      <Link to="/" className="brand">
        Home
      </Link>
      <nav>
        <Link to="/about" className="about">
          About me
        </Link>
      </nav>
    </header>
  );
}
