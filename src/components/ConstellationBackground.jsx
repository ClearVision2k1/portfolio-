import React, { useEffect, useRef } from "react";

// Subtle constellation color palette (Layer 1: Deep cosmic web)
const CONSTELLATION_COLORS = [
  { r: 245, g: 190, b: 60 },   // Warm golden amber
  { r: 56, g: 189, b: 248 },   // Electric sky cyan
  { r: 52, g: 211, b: 153 },   // Subtle emerald mint
  { r: 251, g: 146, b: 60 },   // Soft coral orange
  { r: 192, g: 132, b: 252 },  // Soft lavender
  { r: 240, g: 248, b: 255 },  // Star white highlight
];

// Soft misty color palette (Layer 2: 3D Swirling Cosmic Mist matching user reference media_1793190847781_a7a9a446.png)
// Soft, deep, elegant, non-glaring (NO harsh highlight blowout)
const MIST_CYAN = [
  { r: 22, g: 172, b: 212 },
  { r: 35, g: 148, b: 196 },
  { r: 18, g: 126, b: 172 },
  { r: 42, g: 188, b: 228 },
];

const MIST_CRIMSON = [
  { r: 212, g: 46, b: 82 },
  { r: 188, g: 38, b: 68 },
  { r: 168, g: 28, b: 56 },
  { r: 226, g: 60, b: 96 },
];

const MIST_LAVENDER = { r: 152, g: 62, b: 176 };
const MIST_WHITE = { r: 225, g: 236, b: 250 };

export default function ConstellationBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking state
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;
    let prevMouseX = width / 2;
    let prevMouseY = height / 2;
    let mouseSpeed = 0;
    let targetSpeed = 0;

    // Ultra-smooth 3D rotation angles driven by mouse movement
    let rotX = 0.22;
    let rotY = -0.32;
    let rotZ = 0.10;
    let targetRotX = 0.22;
    let targetRotY = -0.32;
    let targetRotZ = 0.10;

    // Misty swarm center position in background (gently floats across background)
    let swarmCenterX = width / 2;
    let swarmCenterY = height / 2;
    let targetSwarmCenterX = width / 2;
    let targetSwarmCenterY = height / 2;

    const isMobile = width < 768;

    // ========================================================
    // 1. LAYER 1: Full-Page Constellation Network (Deep, minimal)
    // ========================================================
    const nodeCount = isMobile ? 36 : 72;
    const maxConnectDist = isMobile ? 120 : 155;
    const boundX = width * 0.65;
    const boundY = height * 0.65;
    const boundZ = 260;

    const constellationNodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const c = CONSTELLATION_COLORS[Math.floor(Math.random() * CONSTELLATION_COLORS.length)];
      const z = (Math.random() - 0.5) * boundZ * 2;
      const baseRadius = 1.2 + Math.random() * 1.5;
      const depthAlpha = Math.max(0.2, Math.min(1.0, (z + boundZ) / (boundZ * 2)));

      constellationNodes.push({
        x: (Math.random() - 0.5) * boundX * 2,
        y: (Math.random() - 0.5) * boundY * 2,
        z,
        vx: (Math.random() - 0.5) * 0.14,
        vy: (Math.random() - 0.5) * 0.14,
        vz: (Math.random() - 0.5) * 0.08,
        baseRadius,
        color: c,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.001 + Math.random() * 0.0012,
        projX: 0,
        projY: 0,
        scale: 1,
        depthAlpha,
        visible: true,
      });
    }

    // ========================================================
    // 2. LAYER 2: 3D Billowing Cosmic Mist Sheet ("ঘুরি ঘুরি কুয়াশার মতো")
    // Exact visual geometry of reference media_1793190847781_a7a9a446.png:
    // Undulating 3D wave sheet of dual-tone cyan & crimson micro-motes
    // Soft, fine, non-glaring, ethereal fog texture
    // ========================================================
    const mistCount = isMobile ? 1800 : 3800;
    const mistParticles = [];

    const sheetSpanX = Math.min(width, 1400) * (isMobile ? 0.48 : 0.42);
    const sheetSpanY = Math.min(height, 1000) * (isMobile ? 0.44 : 0.38);

    for (let i = 0; i < mistCount; i++) {
      // Parametric coordinates across the 3D sheet: u, v in [-1, 1]
      // Using a slightly feathered distribution with higher density in flowing bands
      const u = (Math.random() - 0.5) * 2;
      const v = (Math.random() - 0.5) * 2;

      // Base planar coordinates
      const bx = u * sheetSpanX;
      const by = v * sheetSpanY;

      // Distance from center of sheet for natural falloff
      const distFromCenter = Math.sqrt(u * u + v * v);

      // 3D undulating wave surface (harmonic folds matching reference image sheet)
      const waveZ =
        Math.sin(u * 2.8 + v * 1.5) * 65 +
        Math.cos(v * 2.5 - u * 1.8) * 55 +
        Math.sin((u + v) * 3.2) * 25;

      // Transverse misty jitter (creates volumetric fog thickness instead of flat plane)
      const jitterX = (Math.random() - 0.5) * 28;
      const jitterY = (Math.random() - 0.5) * 28;
      const jitterZ = (Math.random() - 0.5) * 40;

      // Gentle curve / twist around diagonal axis
      const twistAngle = 0.45 * (u * 0.7 - v * 0.5);
      const cosTwist = Math.cos(twistAngle);
      const sinTwist = Math.sin(twistAngle);

      const x0 = bx + jitterX;
      const y0 = by * cosTwist - waveZ * sinTwist + jitterY;
      const z0 = waveZ * cosTwist + by * sinTwist + jitterZ;

      // Dual-tone color mapping based on folded coordinates (matching reference flow)
      // Reference shows clear diagonal wave bands: Cyan stream and Crimson/Coral stream
      const colorVal = Math.sin(u * 2.4 - v * 2.0 + 0.3);
      let colorObj;
      let isWhite = false;

      if (Math.random() < 0.035) {
        // Subtle stardust grains along crests
        colorObj = MIST_WHITE;
        isWhite = true;
      } else if (colorVal > 0.08) {
        // Soft Cyan / Teal mist stream
        colorObj = MIST_CYAN[Math.floor(Math.random() * MIST_CYAN.length)];
      } else if (colorVal < -0.08) {
        // Soft Crimson / Coral mist stream
        colorObj = MIST_CRIMSON[Math.floor(Math.random() * MIST_CRIMSON.length)];
      } else {
        // Lavender transition boundary
        colorObj = MIST_LAVENDER;
      }

      // Fine micro-mote size: ~0.65px - 1.35px (delicate, misty, non-chunky)
      const baseSize = isWhite ? 1.15 : 0.65 + Math.random() * 0.7;

      mistParticles.push({
        x: x0,
        y: y0,
        z: z0,
        baseU: u,
        baseV: v,
        distFromCenter,
        baseSize,
        color: colorObj,
        isWhite,
        phase: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.7 + Math.random() * 1.2,
      });
    }

    // Resize handling with DPR capping
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

    // Mouse tracking for silky smooth 3D rotation and position drifting
    const handlePointerMove = (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;

      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      targetSpeed = Math.min(Math.sqrt(dx * dx + dy * dy) / 30, 2.0);

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      // 3D rotation angles smoothly driven by mouse position
      const normX = (e.clientX / width - 0.5) * 2;
      const normY = -(e.clientY / height - 0.5) * 2;

      targetRotY = -0.32 + normX * 0.95;
      targetRotX = 0.22 - normY * 0.65;
      targetRotZ = 0.10 + normX * 0.28;

      // Swarm center gently glides across background
      targetSwarmCenterX = width * 0.5 + normX * (width * 0.12);
      targetSwarmCenterY = height * 0.5 - normY * (height * 0.10);
    };

    const handlePointerLeave = () => {
      targetRotY = -0.32;
      targetRotX = 0.22;
      targetRotZ = 0.10;
      targetSwarmCenterX = width / 2;
      targetSwarmCenterY = height / 2;
      targetSpeed = 0;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("mouseleave", handlePointerLeave, { passive: true });

    // Continuous slow laminar swirl angle ("ঘুরি ঘুরি কুয়াশার মতো")
    let baseSpinAngle = 0;

    // Main 60FPS Render Loop
    let lastTime = performance.now();

    const render = (now) => {
      animId = requestAnimationFrame(render);

      if (document.hidden) return;

      const dt = Math.min(now - lastTime, 40);
      lastTime = now;
      const timeSec = now * 0.001;

      // Ultra-smooth speed decay
      mouseSpeed += (targetSpeed - mouseSpeed) * 0.05;
      targetSpeed *= 0.94;

      // Butter-smooth rotation interpolation (lerp factor 0.026 for silky organic glide)
      rotX += (targetRotX - rotX) * 0.026;
      rotY += (targetRotY - rotY) * 0.026;
      rotZ += (targetRotZ - rotZ) * 0.026;

      // Gentle floating of the mist center across the background
      swarmCenterX += (targetSwarmCenterX - swarmCenterX) * 0.022;
      swarmCenterY += (targetSwarmCenterY - swarmCenterY) * 0.022;

      // Continuous slow laminar swirl of the mist ("ঘুরি ঘুরি কুয়াশা")
      baseSpinAngle += 0.0035 + mouseSpeed * 0.0001;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // ========================================================
      // A. DRAW LAYER 1: Full-Page Constellation Network (Deep background)
      // ========================================================
      const cosY = Math.cos(rotY * 0.35);
      const sinY = Math.sin(rotY * 0.35);
      const cosX = Math.cos(rotX * 0.35);
      const sinX = Math.sin(rotX * 0.35);

      const fov = 750;
      const cameraDist = 820;

      // Update & project constellation nodes
      for (let i = 0; i < constellationNodes.length; i++) {
        const p = constellationNodes[i];

        p.x += p.vx + Math.sin(now * 0.0005 + p.phase) * 0.1;
        p.y += p.vy + Math.cos(now * 0.0004 + p.phase) * 0.1;
        p.z += p.vz + Math.sin(now * 0.0003 + p.phase * 1.5) * 0.06;

        if (p.x < -boundX) p.x = boundX;
        if (p.x > boundX) p.x = -boundX;
        if (p.y < -boundY) p.y = boundY;
        if (p.y > boundY) p.y = -boundY;
        if (p.z < -boundZ) p.z = boundZ;
        if (p.z > boundZ) p.z = -boundZ;

        // 3D Rotation
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;
        const y1 = p.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.y * sinX;

        const depth = cameraDist + z2;
        if (depth <= 10) {
          p.visible = false;
          continue;
        }

        const scale = fov / depth;
        p.scale = scale;
        p.projX = centerX + x1 * scale;
        p.projY = centerY + y1 * scale;
        p.visible =
          p.projX >= -40 &&
          p.projX <= width + 40 &&
          p.projY >= -40 &&
          p.projY <= height + 40;
      }

      // Draw constellation connecting lines (subtle)
      ctx.lineWidth = 0.65;
      for (let i = 0; i < constellationNodes.length; i++) {
        const p1 = constellationNodes[i];
        if (!p1.visible) continue;

        for (let j = i + 1; j < constellationNodes.length; j++) {
          const p2 = constellationNodes[j];
          if (!p2.visible) continue;

          const dx = p1.projX - p2.projX;
          const dy = p1.projY - p2.projY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDist) {
            const distRatio = 1 - dist / maxConnectDist;
            const lineAlpha = distRatio * 0.12 * Math.min(p1.depthAlpha, p2.depthAlpha);

            if (lineAlpha > 0.01) {
              const grad = ctx.createLinearGradient(p1.projX, p1.projY, p2.projX, p2.projY);
              grad.addColorStop(0, `rgba(${p1.color.r}, ${p1.color.g}, ${p1.color.b}, ${lineAlpha.toFixed(3)})`);
              grad.addColorStop(1, `rgba(${p2.color.r}, ${p2.color.g}, ${p2.color.b}, ${lineAlpha.toFixed(3)})`);
              ctx.strokeStyle = grad;
              ctx.beginPath();
              ctx.moveTo(p1.projX, p1.projY);
              ctx.lineTo(p2.projX, p2.projY);
              ctx.stroke();
            }
          }
        }
      }

      // Draw constellation nodes
      for (let i = 0; i < constellationNodes.length; i++) {
        const p = constellationNodes[i];
        if (!p.visible) continue;

        const pulse = 1 + Math.sin(now * p.pulseSpeed + p.phase) * 0.1;
        const coreRadius = Math.max(0.9, p.baseRadius * p.scale * pulse);
        const glowRadius = coreRadius * 2.2;

        const c = p.color;
        const coreAlpha = Math.min(0.60, 0.42 * p.depthAlpha);
        const glowAlpha = Math.min(0.15, 0.10 * p.depthAlpha);

        // Soft halo
        const radialGrad = ctx.createRadialGradient(
          p.projX, p.projY, coreRadius * 0.2,
          p.projX, p.projY, glowRadius
        );
        radialGrad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${glowAlpha.toFixed(3)})`);
        radialGrad.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
        ctx.fillStyle = radialGrad;
        ctx.beginPath();
        ctx.arc(p.projX, p.projY, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${coreAlpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.projX, p.projY, coreRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // ========================================================
      // B. DRAW LAYER 2: 3D Billowing Cosmic Mist ("ঘুরি ঘুরি কুয়াশার মতো")
      // Soft, misty opacity, fine micro-motes, NO harsh highlight/blowout
      // ========================================================
      ctx.save();
      // Using 'source-over' (normal blend) prevents harsh additive white blowout,
      // keeping the rich cyan and coral colors deeply saturated and elegant.
      ctx.globalCompositeOperation = "source-over";

      // Swirl rotation in the plane of the sheet
      const cosSpin = Math.cos(baseSpinAngle);
      const sinSpin = Math.sin(baseSpinAngle);

      // 3D Rotation matrix for the mist formation (tilt & roll)
      const pCosY = Math.cos(rotY);
      const pSinY = Math.sin(rotY);
      const pCosX = Math.cos(rotX);
      const pSinX = Math.sin(rotX);
      const pCosZ = Math.cos(rotZ);
      const pSinZ = Math.sin(rotZ);

      const mistFov = 580;
      const mistCameraDist = 620;

      for (let i = 0; i < mistParticles.length; i++) {
        const p = mistParticles[i];

        // 1. Slow laminar vortex swirl across the sheet surface ("ঘুরি ঘুরি")
        const spinX = p.x * cosSpin - p.y * sinSpin;
        const spinY = p.y * cosSpin + p.x * sinSpin;

        // 2. Harmonic wave ripple across the mist cloth (silk/fog billowing)
        const waveZ =
          Math.sin(p.baseU * 3.0 + timeSec * p.wobbleSpeed + p.phase) * 16 +
          Math.cos(p.baseV * 2.5 - timeSec * 0.8) * 14;

        const rx = spinX;
        const ry = spinY;
        const rz = p.z + waveZ;

        // 3. 3D Rotation (Yaw -> Pitch -> Roll)
        const x1 = rx * pCosY - rz * pSinY;
        const z1 = rz * pCosY + rx * pSinY;

        const y1 = ry * pCosX - z1 * pSinX;
        const z2 = z1 * pCosX + ry * pSinX;

        const x2 = x1 * pCosZ - y1 * pSinZ;
        const y2 = y1 * pCosZ + x1 * pSinZ;

        // 4. Perspective projection
        const depth = mistCameraDist + z2;
        if (depth <= 20) continue;
        const scale = mistFov / depth;

        // Projected screen coordinates floating in background
        const projX = swarmCenterX + x2 * scale;
        const projY = swarmCenterY + y2 * scale;

        // Skip off-screen particles
        if (projX < -60 || projX > width + 60 || projY < -60 || projY > height + 60) {
          continue;
        }

        // Fine misty particle size: ~0.65px to 1.35px (delicate motes)
        const pSize = Math.max(0.65, p.baseSize * scale);
        const depthAlpha = Math.max(0.25, Math.min(0.85, (z2 + 160) / 320));

        // Soft, non-glaring misty alpha (max ~0.35 - 0.55, NOT 0.95!)
        // This ensures misty vapor depth without any glaring highlight blowout
        const alpha = depthAlpha * (p.isWhite ? 0.65 : 0.42);

        const c = p.color;

        // Draw fine misty particle mote
        ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(projX, projY, pSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(render);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="constellation-bg-canvas"
      aria-hidden="true"
    />
  );
}

