import React, { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    // Only run custom cursor on desktop devices (> 768px)
    if (typeof window === "undefined" || window.innerWidth < 768) {
      return;
    }

    const cursor = cursorRef.current;
    if (!cursor) return;

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let targetScale = 1;
    let currentScale = 1;
    let targetOpacity = 1;
    let currentOpacity = 1;
    let isHidden = false;
    let animationFrameId;

    // Interactive element detection: immediately hide the circle cursor whenever hovering over links, buttons, etc.
    const isInteractive = (el) => {
      if (!el) return false;
      return !!el.closest(
        "a, button, input, select, textarea, [role='button'], [data-cursor='disable'], .hover-link, .navbar-connect, .navbar-title, .all-works-card, .work-box, .cta-btn, .back-to-home-btn, .resume-button, .social-sidebar a, .tech-badge, .timeline-item"
      );
    };

    const onMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (isInteractive(e.target)) {
        isHidden = true;
        targetScale = 0;
        targetOpacity = 0;
        cursor.classList.add("cursor-hidden");
      } else {
        isHidden = false;
        targetScale = 1;
        targetOpacity = 1;
        cursor.classList.remove("cursor-hidden");
      }
    };

    // Smooth inertia render loop
    const render = () => {
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;
      currentScale += (targetScale - currentScale) * 0.32;
      currentOpacity += (targetOpacity - currentOpacity) * 0.32;

      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(${currentScale.toFixed(3)})`;
      cursor.style.opacity = currentOpacity.toFixed(3);

      if (currentOpacity < 0.02 || isHidden) {
        cursor.style.visibility = "hidden";
      } else {
        cursor.style.visibility = "visible";
      }

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    animationFrameId = requestAnimationFrame(render);

    const handleMouseOver = (e) => {
      if (isInteractive(e.target)) {
        isHidden = true;
        targetScale = 0;
        targetOpacity = 0;
        cursor.classList.add("cursor-hidden");
      } else {
        isHidden = false;
        targetScale = 1;
        targetOpacity = 1;
        cursor.classList.remove("cursor-hidden");
      }
    };

    const handleMouseOut = (e) => {
      if (!e.relatedTarget || !isInteractive(e.relatedTarget)) {
        isHidden = false;
        targetScale = 1;
        targetOpacity = 1;
        cursor.classList.remove("cursor-hidden");
      }
    };

    const handleMouseLeave = () => {
      isHidden = true;
      targetScale = 0;
      targetOpacity = 0;
      cursor.classList.add("cursor-hidden");
    };

    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.addEventListener("mouseout", handleMouseOut, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <div ref={cursorRef} className="custom-cursor" aria-hidden="true" />;
}
