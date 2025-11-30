// src/router.jsx (snippet)
import React, { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import AboutMePage from "./pages/AboutMePage";
const Project = lazy(() => import("./pages/Project"));

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/about", element: <AboutMePage /> },
  { path: "/projects", element: <Projects /> },
  { path: "/projects/:slug", element: <Project /> }, // <-- make sure this exists
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
