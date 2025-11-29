// src/App.jsx
import React, { Suspense } from "react";
import AppRouter from "./router";
import "./styles/base.css";
import "./styles/layout.css";

export default function App() {
  return (
    <Suspense fallback={<div className="loading">Loading...</div>}>
      <AppRouter />
    </Suspense>
  );
}
