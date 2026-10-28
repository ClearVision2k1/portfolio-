import React, { useEffect, useRef } from "react";

export default function CursorParticleSwarm() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Only run on desktop devices with a mouse
    if (typeof window === "undefined" || window.innerWidth < 768) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking state
    let targetX = width / 2;
    let targetY = height / 2;
    let curX = width / 2;
    let curY = height / 2;
    let prevX = width / 2;
    let prevY = height / 2;

    let velX = 0;
    let velY = 0;
    let mouseSpeed = 0;

    // 3D Rotation angles following mouse movement
    let rotX = 0.3;
    let rotY = -0.4;
    let rotZ = 0.2;
    let targetRotX = 0.3;
    let targetRotY = -0.4;
    let targetRotZ = 0.2;

    // Fade opacity state (hides when hovering over clickable links/text)
    let curAlpha = 0;
    let targetAlpha = 1;
    let isOverInteractive = false;

    // Particle Swarm Configuration
    // ~850 micro particles forming a compact 3D swirling cloud around the cursor arrow
    const PARTICLE_COUNT = 850;
    const maxRadius = 78; // Compact radius: tightly localized around the cursor arrow

    // Color palettes sampled directly from user's reference image:
    // Cyan stream
    const cyanColors = [
      { r: 0, g: 235, b: 255 },
      { r: 56, g: 189, b: 248 },
      { r: 14, g: 165, b: 233 },
    ];
    // Crimson / Hot Coral stream
    const crimsonColors = [
      { r: 255, g: 26, b: 78 },
      { r: 244, g: 63, b: 94 },
      { r: 225, g: 29, b: 72 },
    ];
    // Transition Magenta & White sparkles
    const magentaColor = { r: 217, g: 70, b: 239 };
    const whiteColor = { r: 255, g: 255, b: 255 };

    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Stratified radial distribution with concentrated core and soft outer rim
      const r = Math.pow(Math.random(), 0.65) * maxRadius + 4;
      const baseTheta = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.5) * maxRadius * 0.85;

      // Dual-toned diagonal swirling division matching reference image:
      // Half of the cloud ribbon is Cyan, the other half is Crimson, with white sparkles along crests
      const swirlFactor = Math.sin(baseTheta * 1.5) * 0.45 + (Math.random() - 0.5) * 0.3;
      let colorObj;
      let isWhite = false;

      if (Math.random() < 0.05) {
        colorObj = whiteColor;
        isWhite = true;
      } else if (swirlFactor > 0.05) {
        colorObj = cyanColors[Math.floor(Math.random() * cyanColors.length)];
      } else if (swirlFactor < -0.05) {
        colorObj = crimsonColors[Math.floor(Math.random() * crimsonColors.length)];
      } else {
        colorObj = Math.random() > 0.5 ? magentaColor : cyanColors[0];
      }

      particles.push({
        r,
        baseTheta,
        orbitSpeed: (0.012 + Math.random() * 0.022) * (Math.random() > 0.4 ? 1 : -0.7),
        elevation,
        baseSize: isWhite ? 1.6 : 1.1 + Math.random() * 1.4,
        color: colorObj,
        isWhite,
        phase: Math.random() * Math.PI * 2,
        wobbleFreq: 1.5 + Math.random() * 2.5,
      });
    }

    // Handle Resize
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Interactive element detection (hide particles when cursor is on text/links)
    const checkInteractive = (el) => {
      if (!el) return false;
      return !!el.closest(
        "a, button, input, select, textarea, [role='button'], [data-cursor='disable'], .hover-link, .navbar-connect, .navbar-title, .all-works-card, .work-box, .cta-btn, .back-to-home-btn, .resume-button, .social-sidebar a"
      );
    };

    // Track mouse movement
    const onPointerMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;

      velX = e.clientX - prevX;
      velY = e.clientY - prevY;
      mouseSpeed = Math.sqrt(velX * velX + velY * velY);

      prevX = e.clientX;
      prevY = e.clientY;

      // 3D rotation following mouse movement ("মাউসের সাথে সাথে এটা ঘুরবে")
      const normX = (e.clientX / width - 0.5) * 2;
      const normY = -(e.clientY / height - 0.5) * 2;

      targetRotY = -0.4 + normX * 1.25 + velX * 0.035;
      targetRotX = 0.3 - normY * 0.95 + velY * 0.035;
      targetRotZ = 0.2 + velX * 0.025;

      // If hovering over a link or button, smoothly hide the particle swarm
      if (checkInteractive(e.target)) {
        isOverInteractive = true;
        targetAlpha = 0;
      } else {
        isOverInteractive = false;
        targetAlpha = 1;
      }
    };

    const onPointerLeave = () => {
      targetAlpha = 0;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave, { passive: true });

    // 60FPS Render Loop
    let animId;
    let lastTime = performance.now();

    const render = (now) => {
      animId = requestAnimationFrame(render);

      if (document.hidden) return;

      const dt = Math.min(now - lastTime, 40);
      lastTime = now;
      const timeSec = now * 0.001;

      // Smooth camera / cursor following with light trailing inertia
      curX += (targetX - curX) * 0.22;
      curY += (targetY - curY) * 0.22;

      // Smooth alpha transition
      curAlpha += (targetAlpha - curAlpha) * 0.15;

      // Smooth 3D rotation interpolation
      rotX += (targetRotX - rotX) * 0.08;
      rotY += (targetRotY - rotY) * 0.08;
      rotZ += (targetRotZ - rotZ) * 0.08;

      // Ambient idle rotation even when mouse is still
      rotY += 0.008;

      ctx.clearRect(0, 0, width, height);

      // If completely invisible, skip drawing
      if (curAlpha < 0.01) return;

      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // Precalculate 3D rotation trigonometric values
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosZ = Math.cos(rotZ);
      const sinZ = Math.sin(rotZ);

      const fov = 260;

      // Render each particle in the compact 3D swarm
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 3D Orbital Swirl & Harmonic Undulation
        const currentTheta = p.baseTheta + timeSec * p.orbitSpeed * 1.5;
        const wave = Math.sin(timeSec * p.wobbleFreq + p.phase) * 6;

        // Base relative coordinates
        const rx = Math.cos(currentTheta) * p.r;
        const ry = Math.sin(currentTheta) * p.r * 0.85 + Math.sin(rx * 0.08 + timeSec) * 5;
        const rz = p.elevation + wave;

        // 3D Rotation (around Y, then X, then Z)
        const x1 = rx * cosY - rz * sinY;
        const z1 = rz * cosY + rx * sinY;

        const y1 = ry * cosX - z1 * sinX;
        const z2 = z1 * cosX + ry * sinX;

        const x2 = x1 * cosZ - y1 * sinZ;
        const y2 = y1 * cosZ + x1 * sinZ;

        // Perspective projection
        const depth = fov + z2;
        if (depth <= 10) continue;
        const scale = fov / depth;

        // Projected screen coordinates right around cursor arrow
        const projX = curX + x2 * scale;
        const projY = curY + y2 * scale;

        // Particle size & depth-based alpha
        const pSize = Math.max(0.8, p.baseSize * scale);
        const depthAlpha = Math.max(0.25, Math.min(1.0, (z2 + 60) / 120));
        const alpha = curAlpha * depthAlpha * (p.isWhite ? 0.95 : 0.82);

        const c = p.color;

        // Draw crisp core dot
        ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(projX, projY, pSize, 0, Math.PI * 2);
        ctx.fill();

        // Soft outer glow for prominent particles
        if (p.r < maxRadius * 0.7 && pSize > 1.3) {
          ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${(alpha * 0.35).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(projX, projY, pSize * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(render);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="cursor-particle-swarm-canvas"
      aria-hidden="true"
    />
  );
}
