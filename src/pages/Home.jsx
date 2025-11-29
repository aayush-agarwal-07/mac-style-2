// src/pages/Home.jsx

import HeroCta from "../components/HeroCta";
import Header from "./Header";

export default function Home() {
  return (
    <>
      <main className="home">
        {/* <h2 className="header">My Work</h2> */}
        <Header/>
        <HeroCta />
      </main>
    </>
  );
}
