import React, { useState } from "react";
import Navbar from "../components/Navbar";
import ThreeCharacter from "../components/ThreeCharacter";
import LoadingScreen from "../components/LoadingScreen";
import Hero from "../components/Hero";
import About from "../components/About";
import WhatIDo from "../components/WhatIDo";
import CareerTimeline from "../components/CareerTimeline";
import WorkSection from "../components/WorkSection";
import TechStack from "../components/TechStack";
import Contact from "../components/Contact";
import gsap from "gsap";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);

    // Initial entrance animations matching redoyanulhaque.me initialFX
    gsap.fromTo(
      [".landing-intro h2", ".landing-intro h1", ".landing-roles"],
      { opacity: 0, y: 50 },
      { opacity: 1, duration: 1.2, ease: "power3.out", y: 0, stagger: 0.1, delay: 0.2 }
    );

    gsap.fromTo(
      [".header", ".social-sidebar", ".resume-button"],
      { opacity: 0 },
      { opacity: 1, duration: 1.2, ease: "power2.out", delay: 0.3 }
    );
  };

  return (
    <>
      {/* Signature Pre-Loader Screen */}
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}

      {/* Floating Header Navbar */}
      <Navbar onRestartLoader={() => setIsLoading(true)} />

      {/* Signature 3D Interactive WebGL Character & Parallax Model */}
      <ThreeCharacter />

      {/* Main Content Sections */}
      <main className={isLoading ? "main-hidden" : "main-active"}>
        <Hero />
        <About />
        <WhatIDo />
        <CareerTimeline />
        <WorkSection />
        <TechStack />
        <Contact />
      </main>
    </>
  );
}
