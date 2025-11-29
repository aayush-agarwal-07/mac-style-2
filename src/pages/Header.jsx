// src/components/Header.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./../styles/layout.css";

export default function Header(){
  return (
    <header className="site-header">
      <div className="brand">Kunal Rastogi</div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/category/website-banners">Categories</Link>
        <Link to="/about">About</Link>
      </nav>
    </header>
  );
}
