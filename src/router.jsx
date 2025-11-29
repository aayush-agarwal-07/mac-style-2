// src/router.jsx (snippet)
import React, { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
const Project = lazy(() => import("./pages/Project"));

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/projects", element: <Projects /> },
  { path: "/projects/:slug", element: <Project /> },   // <-- make sure this exists
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
