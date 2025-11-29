// src/components/FolderCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import FolderIconImg from "../assets/placeholders/mac_style_folder_icon.svg";

import useInView from "./useInView"; // ensure this file exists

export default function FolderCard({ to = "/", title = "Untitled", delay = 0 }) {
  // hook returns domRef and boolean isVisible
  const { domRef, isVisible } = useInView({ threshold: 0.12, once: true });

  return (
    <div
      ref={domRef}
      className={`folder-card ${isVisible ? "visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <Link to={to} className="folder-link" aria-label={title}>
        <div className="folder-icon">
  <img src={FolderIconImg} alt="" />
</div>
        <div className="folder-title">{title}</div>
      </Link>
    </div>
  );
}
