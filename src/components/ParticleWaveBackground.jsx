import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ParticleWaveBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Scene & Perspective Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 1000);
    camera.position.set(0, 0, 24);

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);
    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100vw";
    renderer.domElement.style.height = "100vh";
    renderer.domElement.style.pointerEvents = "none";
    renderer.domElement.style.zIndex = "0";
    renderer.domElement.style.opacity = "0.92";

    container.appendChild(renderer.domElement);

    // 3. Dense 3D Particle Wave Field (Matching Reference Image)
    const isMobile = width < 768;
    const countX = isMobile ? 90 : 160;
    const countY = isMobile ? 90 : 160;
    const totalParticles = countX * countY;

    const positions = new Float32Array(totalParticles * 3);
    const basePositions = new Float32Array(totalParticles * 3);
    const colors = new Float32Array(totalParticles * 3);
    const phases = new Float32Array(totalParticles);

    // Colors sampled directly from user's reference image:
    // Cyan stream
    const cCyan1 = new THREE.Color("#00f0ff");
    const cCyan2 = new THREE.Color("#38bdf8");
    const cCyan3 = new THREE.Color("#0284c7");

    // Crimson & Coral-Pink stream
    const cCrimson1 = new THREE.Color("#ff1744");
    const cCrimson2 = new THREE.Color("#f43f5e");
    const cCrimson3 = new THREE.Color("#e11d48");

    // Magenta blend & Diamond White
    const cMagenta = new THREE.Color("#d946ef");
    const cWhite = new THREE.Color("#ffffff");

    let idx = 0;
    const spreadX = 22.0;
    const spreadY = 22.0;

    for (let i = 0; i < countX; i++) {
      const u = (i / (countX - 1) - 0.5) * 2; // -1 to 1

      for (let j = 0; j < countY; j++) {
        const v = (j / (countY - 1) - 0.5) * 2; // -1 to 1

        const x = u * spreadX + (Math.random() - 0.5) * 0.2;
        const y = v * spreadY + (Math.random() - 0.5) * 0.2;
        const z = (Math.random() - 0.5) * 0.3;

        positions[idx * 3] = x;
        positions[idx * 3 + 1] = y;
        positions[idx * 3 + 2] = z;

        basePositions[idx * 3] = x;
        basePositions[idx * 3 + 1] = y;
        basePositions[idx * 3 + 2] = z;

        phases[idx] = Math.random() * Math.PI * 2;

        // Diagonal swirl boundary between Cyan and Crimson matching reference image
        const diagonal =
          u * 0.85 -
          v * 0.65 +
          Math.sin(u * 3.2 + v * 2.4) * 0.38 +
          (Math.random() - 0.5) * 0.16;

        const pColor = new THREE.Color();

        if (Math.random() < 0.05) {
          // Sparkling white particles
          pColor.copy(cWhite);
        } else if (diagonal > 0.12) {
          // Cyan / Turquoise stream
          const t = Math.random();
          if (t < 0.5) {
            pColor.lerpColors(cCyan1, cCyan2, t * 2);
          } else {
            pColor.lerpColors(cCyan2, cCyan3, (t - 0.5) * 2);
          }
        } else if (diagonal < -0.12) {
          // Crimson / Ruby Coral stream
          const t = Math.random();
          if (t < 0.5) {
            pColor.lerpColors(cCrimson1, cCrimson2, t * 2);
          } else {
            pColor.lerpColors(cCrimson2, cCrimson3, (t - 0.5) * 2);
          }
        } else {
          // Swirling transition ridge
          const mixFactor = (diagonal + 0.12) / 0.24;
          if (Math.random() > 0.45) {
            pColor.lerpColors(cCrimson2, cCyan2, mixFactor);
          } else {
            pColor.lerpColors(cCrimson1, cMagenta, Math.random());
          }
        }

        colors[idx * 3] = pColor.r;
        colors[idx * 3 + 1] = pColor.g;
        colors[idx * 3 + 2] = pColor.b;

        idx++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aBasePos", new THREE.BufferAttribute(basePositions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

    // 4. Custom GLSL Shader with Screen-Space Interactive Mouse Ripple
    const vertexShader = `
      uniform float uTime;
      uniform vec2 uMouseNDC;
      uniform float uMouseSpeed;
      uniform float uAspect;
      uniform float uPixelRatio;

      attribute vec3 aBasePos;
      attribute float aPhase;
      attribute vec3 color;

      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vec3 pos = aBasePos;

        // Multi-frequency harmonic wave folds creating organic volumetric ribbons
        float wave1 = sin(pos.x * 0.32 + uTime * 0.85 + aPhase) * 1.6;
        float wave2 = cos(pos.y * 0.32 + uTime * 0.75 + pos.x * 0.25) * 1.5;
        float wave3 = sin((pos.x * 0.55 + pos.y * 0.45) + uTime * 1.1) * 0.9;
        float wave4 = cos(length(pos.xy) * 0.28 - uTime * 1.3) * 1.1;
        float wave5 = sin(pos.x * 0.8 - pos.y * 0.8 + uTime * 1.5) * 0.6;

        pos.z += wave1 + wave2 + wave3 + wave4 + wave5;

        // Project candidate position to screen to compute true screen-space distance to cursor
        vec4 tempPos = modelViewMatrix * vec4(pos, 1.0);
        vec4 clipPos = projectionMatrix * tempPos;
        vec2 screenNDC = clipPos.xy / clipPos.w;

        // Aspect-corrected distance to mouse
        vec2 mouseDiff = (screenNDC - uMouseNDC) * vec2(uAspect, 1.0);
        float mouseDist = length(mouseDiff);

        // Responsive interactive motion wherever mouse goes ("যেখানে মাউস দিবো সেখানে এটা মোশন করবে")
        float influenceRadius = 0.42;
        float mouseInfluence = smoothstep(influenceRadius, 0.0, mouseDist);

        // Dynamic fluid wave ripple radiating outward from mouse
        float rippleZ = sin(mouseDist * 22.0 - uTime * 5.0) * mouseInfluence * (2.8 + uMouseSpeed * 2.0);
        pos.z += rippleZ;

        // Subtle lateral repulsion push away from mouse
        if (mouseDist > 0.001) {
          pos.xy += (mouseDiff / mouseDist) * mouseInfluence * 1.2;
        }

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // Particle size with distance attenuation
        float pSize = (17.0 / -mvPosition.z) * uPixelRatio;
        gl_PointSize = clamp(pSize, 2.0, 16.0);

        // Dynamic luminance boost near cursor
        vec3 finalColor = color;
        finalColor += vec3(0.22, 0.16, 0.28) * mouseInfluence;

        vColor = finalColor;
        vAlpha = smoothstep(42.0, 10.0, -mvPosition.z);
      }
    `;

    const fragmentShader = `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        // Anti-aliased circular particle with glowing halo
        float dist = distance(gl_PointCoord, vec2(0.5));
        if (dist > 0.5) discard;

        float glow = smoothstep(0.5, 0.06, dist);
        float core = smoothstep(0.24, 0.0, dist);

        vec3 finalColor = vColor * 1.25 + vec3(0.4) * core;
        float alpha = (glow * 0.8 + core * 0.2) * vAlpha * 0.9;

        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    const uniforms = {
      uTime: { value: 0 },
      uMouseNDC: { value: new THREE.Vector2(-999, -999) },
      uMouseSpeed: { value: 0 },
      uAspect: { value: width / height },
      uPixelRatio: { value: dpr },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    // Initial organic tilt angle matching reference image
    points.rotation.x = 0.35;
    points.rotation.y = -0.45;
    points.rotation.z = 0.25;
    scene.add(points);

    // 5. Interactive Mouse Tracking & Dynamic 3D Rotation ("মাউসের সাথে সাথে এটা ঘুরবে")
    let targetNDC_X = -999;
    let targetNDC_Y = -999;
    let curNDC_X = -999;
    let curNDC_Y = -999;

    let prevClientX = width / 2;
    let prevClientY = height / 2;
    let mouseSpeed = 0;
    let targetSpeed = 0;

    let targetRotY = -0.45;
    let targetRotX = 0.35;
    let targetRotZ = 0.25;

    let curRotY = -0.45;
    let curRotX = 0.35;
    let curRotZ = 0.25;

    const handlePointerMove = (e) => {
      // Normalized Device Coordinates (-1 to 1)
      const ndcX = (e.clientX / width) * 2 - 1;
      const ndcY = -(e.clientY / height) * 2 + 1;

      targetNDC_X = ndcX;
      targetNDC_Y = ndcY;

      // 3D Rotation dynamically turning with mouse ("মাউসের সাথে সাথে এটা ঘুরবে")
      targetRotY = -0.45 + ndcX * 1.15;
      targetRotX = 0.35 - ndcY * 0.75;
      targetRotZ = 0.25 + ndcX * 0.45;

      // Calculate mouse speed for dynamic ripple amplification
      const dx = e.clientX - prevClientX;
      const dy = e.clientY - prevClientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      targetSpeed = Math.min(dist / 25, 3.0);

      prevClientX = e.clientX;
      prevClientY = e.clientY;
    };

    const handlePointerLeave = () => {
      targetNDC_X = -999;
      targetNDC_Y = -999;
      targetRotY = -0.45;
      targetRotX = 0.35;
      targetRotZ = 0.25;
      targetSpeed = 0;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("mouseleave", handlePointerLeave, { passive: true });

    // 6. Responsive Window Resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      const newDpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(newDpr);
      renderer.setSize(width, height);
      uniforms.uPixelRatio.value = newDpr;
      uniforms.uAspect.value = width / height;
    };
    window.addEventListener("resize", handleResize);

    // 7. 60FPS Render Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (document.hidden) return;

      const elapsedTime = clock.getElapsedTime();
      uniforms.uTime.value = elapsedTime;

      // Smooth lerp for mouse screen position
      if (targetNDC_X > -900) {
        if (curNDC_X < -900) {
          curNDC_X = targetNDC_X;
          curNDC_Y = targetNDC_Y;
        } else {
          curNDC_X += (targetNDC_X - curNDC_X) * 0.12;
          curNDC_Y += (targetNDC_Y - curNDC_Y) * 0.12;
        }
        uniforms.uMouseNDC.value.set(curNDC_X, curNDC_Y);
      } else {
        curNDC_X = -999;
        curNDC_Y = -999;
        uniforms.uMouseNDC.value.set(-999, -999);
      }

      // Smooth decay for mouse speed
      mouseSpeed += (targetSpeed - mouseSpeed) * 0.1;
      targetSpeed *= 0.92;
      uniforms.uMouseSpeed.value = mouseSpeed;

      // Smooth 3D rotation following mouse + harmonic breathing drift
      curRotX += (targetRotX - curRotX) * 0.05;
      curRotY += (targetRotY - curRotY) * 0.05;
      curRotZ += (targetRotZ - curRotZ) * 0.05;

      const ambientDriftY = Math.sin(elapsedTime * 0.28) * 0.1;
      const ambientDriftX = Math.cos(elapsedTime * 0.22) * 0.08;

      points.rotation.x = curRotX + ambientDriftX;
      points.rotation.y = curRotY + ambientDriftY;
      points.rotation.z = curRotZ;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mouseleave", handlePointerLeave);
      window.removeEventListener("resize", handleResize);

      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="particle-wave-background" aria-hidden="true" />;
}
