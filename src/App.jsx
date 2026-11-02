import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useLenis } from "./hooks/useLenis";
import ConstellationBackground from "./components/ConstellationBackground";
import SocialSidebar from "./components/SocialSidebar";
import ResumeButton from "./components/ResumeButton";
import Home from "./pages/Home";
import AllWorks from "./pages/AllWorks";
import AdminAuthModal from "./components/AdminAuthModal";

// Lazy-load Admin Dashboard so visitors don't download admin code unnecessarily
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

// ScrollToTop component ensuring window scrolls to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

export default function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  // Initialize Lenis smooth scroll
  useLenis();

  return (
    <>
      {/* 3D Cosmic Background: Full-page Constellation + Swirling 3D Petals (strictly in background at z-index: 0) */}
      <ConstellationBackground />

      {/* Global Admin Passkey Modal triggered by Ctrl + E */}
      <AdminAuthModal />

      {/* Scroll restoration helper */}
      <ScrollToTop />

      {/* Persistent desktop social bar and 90-degree resume button (hidden on /admin) */}
      {!isAdmin && <SocialSidebar />}
      {!isAdmin && <ResumeButton />}

      {/* Application Routing */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/myworks" element={<AllWorks />} />
        <Route
          path="/admin"
          element={
            <Suspense
              fallback={
                <div
                  className="admin-page"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                  }}
                >
                  <div className="admin-spinner" />
                </div>
              }
            >
              <AdminDashboard />
            </Suspense>
          }
        />
        <Route path="/works" element={<Navigate to="/myworks" replace />} />
        <Route path="/projects" element={<Navigate to="/myworks" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
