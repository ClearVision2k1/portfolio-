import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useLenis } from "./hooks/useLenis";
import ConstellationBackground from "./components/ConstellationBackground";
import SocialSidebar from "./components/SocialSidebar";
import ResumeButton from "./components/ResumeButton";
import Home from "./pages/Home";
import AllWorks from "./pages/AllWorks";

// ScrollToTop component ensuring window scrolls to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

export default function App() {
  // Initialize Lenis smooth scroll
  useLenis();

  return (
    <>
      {/* 3D Cosmic Background: Full-page Constellation + Swirling 3D Petals (strictly in background at z-index: 0) */}
      <ConstellationBackground />

      {/* Scroll restoration helper */}
      <ScrollToTop />

      {/* Persistent desktop social bar and 90-degree resume button */}
      <SocialSidebar />
      <ResumeButton />

      {/* Application Routing */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/myworks" element={<AllWorks />} />
        <Route path="/works" element={<Navigate to="/myworks" replace />} />
        <Route path="/projects" element={<Navigate to="/myworks" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
