// src/pages/Home.jsx

import { Link } from "react-router-dom";
import HeroCta from "../components/HeroCta";
import Header from "./Header";
import AboutMe from "../components/AboutMe";

export default function Home() {
  return (
    <>
      <main className="home">
        {/* <h2 className="header">My Work</h2> */}
        <Header />
        <HeroCta />
      </main>
      <AboutMe />
    </>
  );
}
