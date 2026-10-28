import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";

gsap.registerPlugin(ScrollTrigger);

// Bone lists matching redoyanulhaque.me reference
const TYPING_BONES = [
  "thighL", "thighR", "shinL", "shinR", "forearmL", "forearmR", "handL", "handR",
  "f_pinky03R", "f_pinky02L", "f_pinky02R", "f_pinky01L", "f_pinky01R",
  "palm04L", "palm04R", "f_ring01L", "thumb01L", "thumb01R", "thumb03L", "thumb03R",
  "palm02L", "palm02R", "palm01L", "palm01R", "f_index01L", "f_index01R",
  "palm03L", "palm03R", "f_ring02L", "f_ring02R", "f_ring01R", "f_ring03L", "f_ring03R",
  "f_middle01L", "f_middle02L", "f_middle03L", "f_middle01R", "f_middle02R", "f_middle03R",
  "f_index02L", "f_index03L", "f_index02R", "f_index03R", "thumb02L", "f_pinky03L",
  "upper_armL", "upper_armR", "thumb02R", "toeL", "heel02L", "toeR", "heel02R",
  "thigh", "shin", "forearm", "hand", "f_pinky", "palm", "f_ring", "thumb",
  "f_index", "f_middle", "upper_arm", "toe", "heel"
];

const BROW_BONES = ["eyebrow_L", "eyebrow_R", "eyebrow"];

function filterClip(clip, allowedNames) {
  const tracks = clip.tracks.filter((t) => {
    const cleanTrack = t.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return allowedNames.some((name) =>
      cleanTrack.includes(name.toLowerCase().replace(/[^a-z0-9]/g, ""))
    );
  });
  return new THREE.AnimationClip(clip.name + "_filtered", clip.duration, tracks);
}

export default function ThreeCharacter() {
  const containerRef = useRef(null);
  const hoverRef = useRef(null);

  useEffect(() => {
    // Only run 3D WebGL character on desktop screens (> 768px)
    if (typeof window === "undefined" || window.innerWidth <= 768) return;

    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Perspective Camera (matching exact reference values: 14.5 fov, pos (0, 13.1, 24.7), zoom 1.1)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(14.5, width / height, 0.1, 1000);
    camera.position.set(0, 13.1, 24.7);
    camera.zoom = 1.1;
    camera.updateProjectionMatrix();

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: window.devicePixelRatio < 2,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.domElement.style.position = "relative";
    renderer.domElement.style.pointerEvents = "none";
    renderer.domElement.style.zIndex = "2";
    container.appendChild(renderer.domElement);

    // 3. Lighting & HDR Environment Map
    const dirLight = new THREE.DirectionalLight(0xc7b5ff, 1.2);
    dirLight.position.set(-0.47, -0.32, -1);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xc2a4ff, 1.5, 100, 3);
    pointLight.position.set(3, 12, 4);
    scene.add(pointLight);

    const ambLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambLight);

    new RGBELoader().load(
      "/char_enviorment.hdr",
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        scene.environmentIntensity = 0.64;
        scene.environmentRotation.set(5.76, 85.85, 1);
      },
      undefined,
      (err) => console.warn("HDR env map load warning:", err)
    );

    // 4. Load 3D Character Model (.glb) with DRACOLoader
    let mixer = null;
    let spine006 = null;
    let spine005 = null;
    let screenlightMesh = null;
    let laptopMesh = null;
    let browUpAction = null;
    let scrollTriggerCleanups = [];

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load(
      "/character.glb",
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = false;
            child.frustumCulled = true;
            if (child.material && !Array.isArray(child.material)) {
              child.material.precision = "mediump";
            }
          }

          // Identify laptop meshes for ScrollTrigger transitions
          if (child.name === "Plane004" || child.name === "Plane.004") {
            if (child.children && child.children.length > 0) {
              child.children.forEach((sub) => {
                if (sub.material) {
                  sub.material.transparent = true;
                  sub.material.opacity = 0;
                  if (
                    sub.material.name === "Material.027" ||
                    sub.material.name === "material.027"
                  ) {
                    laptopMesh = sub;
                    sub.material.color.set("#FFFFFF");
                  }
                }
              });
            } else if (child.material) {
              child.material.transparent = true;
              child.material.opacity = 0;
              laptopMesh = child;
              child.material.color.set("#FFFFFF");
            }
          }

          if (child.name === "screenlight") {
            if (child.material) {
              child.material.transparent = true;
              child.material.opacity = 0;
              child.material.emissive.set("#C8BFFF");
              screenlightMesh = child;
            }
          }
        });

        // Feet alignment
        const footR = model.getObjectByName("foot.R") || model.getObjectByName("footR");
        if (footR) footR.position.y = 3.36;
        const footL = model.getObjectByName("foot.L") || model.getObjectByName("footL");
        if (footL) footL.position.y = 3.36;

        // Head tracking bone
        spine006 =
          model.getObjectByName("spine.006") ||
          model.getObjectByName("spine006") ||
          null;

        spine005 =
          model.getObjectByName("spine.005") ||
          model.getObjectByName("spine005") ||
          null;

        // Setup Animations & Mixer
        mixer = new THREE.AnimationMixer(model);

        if (gltf.animations && gltf.animations.length > 0) {
          // 1. Intro Animation
          const intro = gltf.animations.find((a) => a.name === "introAnimation");
          if (intro) {
            const act = mixer.clipAction(intro);
            act.setLoop(THREE.LoopOnce, 1);
            act.clampWhenFinished = true;
            act.play();
          }

          // 2. Typing keyboard keys
          ["key1", "key2", "key5", "key6"].forEach((keyName) => {
            const clip = THREE.AnimationClip.findByName(gltf.animations, keyName);
            if (clip) {
              const act = mixer.clipAction(clip);
              act.play();
              act.timeScale = 1.2;
            }
          });

          // 3. Filtered typing on arms/hands
          const typing = THREE.AnimationClip.findByName(gltf.animations, "typing");
          if (typing) {
            const filteredTyping = filterClip(typing, TYPING_BONES);
            const act = mixer.clipAction(filteredTyping);
            act.enabled = true;
            act.play();
            act.timeScale = 1.2;
          }

          // 4. Blinking Eyes
          const blink = gltf.animations.find((a) => a.name === "Blink");
          if (blink) {
            setTimeout(() => {
              if (mixer) {
                const act = mixer.clipAction(blink);
                act.play().fadeIn(0.5);
              }
            }, 2500);
          }

          // 5. Eyebrows on hover reaction
          const brow = gltf.animations.find((a) => a.name === "browup");
          if (brow) {
            const filteredBrow = filterClip(brow, BROW_BONES);
            browUpAction = mixer.clipAction(filteredBrow);
            browUpAction.setLoop(THREE.LoopOnce, 1);
            browUpAction.clampWhenFinished = true;
            browUpAction.enabled = true;
          }
        }

        // 5. Setup Signature GSAP ScrollTrigger Transitions across Landing, About, and What I Do
        let flicker = 0;
        const flickerInterval = setInterval(() => {
          flicker = Math.random();
        }, 200);

        if (screenlightMesh && screenlightMesh.material) {
          gsap.timeline({ repeat: -1, repeatRefresh: true }).to(screenlightMesh.material, {
            emissiveIntensity: () => 8 * flicker,
            duration: () => 0.6 * Math.random(),
            delay: () => 0.1 * Math.random(),
          });
        }

        const landingTL = gsap.timeline({
          scrollTrigger: {
            trigger: ".landing-section",
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        const aboutTL = gsap.timeline({
          scrollTrigger: {
            trigger: ".about-section",
            start: "center 55%",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        const whatTL = gsap.timeline({
          scrollTrigger: {
            trigger: ".whatIDO",
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        if (window.innerWidth > 1024) {
          // Landing -> About
          landingTL
            .fromTo(model.rotation, { y: 0 }, { y: 0.7, duration: 1 }, 0)
            .to(camera.position, { z: 22 }, 0)
            .fromTo(".character-model", { x: 0 }, { x: "-25%", duration: 1 }, 0)
            .to(".landing-container", { opacity: 0, duration: 0.4 }, 0)
            .to(".landing-container", { y: "40%", duration: 0.8 }, 0)
            .fromTo(".about-me", { y: "-50%" }, { y: "0%" }, 0);

          // About -> What I Do
          aboutTL
            .to(camera.position, { z: 75, y: 8.4, duration: 6, delay: 2, ease: "power3.inOut" }, 0)
            .to(".about-section", { y: "30%", duration: 6 }, 0)
            .to(".about-section", { opacity: 0, delay: 3, duration: 2 }, 0)
            .fromTo(
              ".character-model",
              { pointerEvents: "inherit" },
              { pointerEvents: "none", x: "-12%", delay: 2, duration: 5 },
              0
            )
            .to(model.rotation, { y: 0.92, x: 0.12, delay: 3, duration: 3 }, 0)
            .to(spine005 ? spine005.rotation : {}, { x: 0.6, delay: 2, duration: 3 }, 0);

          if (laptopMesh) {
            aboutTL
              .to(laptopMesh.material, { opacity: 1, duration: 0.8, delay: 3.2 }, 0)
              .fromTo(laptopMesh.position, { y: -10, z: 2 }, { y: 0, z: 0, delay: 1.5, duration: 3 }, 0);
          }
          if (screenlightMesh) {
            aboutTL.to(screenlightMesh.material, { opacity: 1, duration: 0.8, delay: 4.5 }, 0);
          }

          aboutTL
            .fromTo(".what-box-in", { display: "none" }, { display: "flex", duration: 0.1, delay: 6 }, 0)
            .fromTo(
              ".character-rim",
              { opacity: 1, scaleX: 1.4 },
              { opacity: 0, scale: 0, y: "-70%", duration: 5, delay: 2 },
              0.3
            );

          // What I Do -> Away
          whatTL
            .fromTo(".character-model", { y: "0%" }, { y: "-100%", duration: 4, ease: "none", delay: 1 }, 0)
            .fromTo(".whatIDO", { y: 0 }, { y: "15%", duration: 2 }, 0)
            .to(model.rotation, { x: -0.04, duration: 2, delay: 1 }, 0);
        }

        scrollTriggerCleanups.push(() => {
          clearInterval(flickerInterval);
          landingTL.kill();
          aboutTL.kill();
          whatTL.kill();
        });

        // Entrance light glow
        gsap.to(".character-rim", { y: "55%", opacity: 1, delay: 0.2, duration: 2 });
      },
      undefined,
      (err) => console.error("GLTF load error:", err)
    );

    // 6. Interactive Mouse Tracking
    let mouse = { x: 0, y: 0 };
    const sensitivity = { x: 0.1, y: 0.2 };

    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mousemove", onMouseMove, { passive: true });

    // Hover eyebrow raise
    const hoverEl = hoverRef.current;
    let isHovered = false;
    const onMouseEnter = () => {
      if (browUpAction && !isHovered) {
        isHovered = true;
        browUpAction.reset();
        browUpAction.enabled = true;
        browUpAction.setEffectiveWeight(4);
        browUpAction.fadeIn(0.5).play();
      }
    };
    const onMouseLeave = () => {
      if (browUpAction && isHovered) {
        isHovered = false;
        browUpAction.fadeOut(0.6);
      }
    };
    if (hoverEl) {
      hoverEl.addEventListener("mouseenter", onMouseEnter);
      hoverEl.addEventListener("mouseleave", onMouseLeave);
    }

    // 7. Render Animation Loop
    const clock = new THREE.Clock();
    let reqId;

    const animate = () => {
      reqId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);

      // Spine rotation follows mouse cursor (calculated AFTER mixer update to guarantee override)
      if (spine006) {
        if (window.scrollY < 200) {
          const angleLimit = Math.PI / 6; // 30 degrees limit
          spine006.rotation.y = THREE.MathUtils.lerp(
            spine006.rotation.y,
            mouse.x * angleLimit,
            sensitivity.x
          );
          const minY = -0.3;
          const maxY = 0.4;
          const clampedY =
            mouse.y > minY
              ? mouse.y < maxY
                ? -mouse.y - 0.5 * angleLimit
                : -angleLimit - 0.5 * angleLimit
              : -minY - 0.5 * angleLimit;
          spine006.rotation.x = THREE.MathUtils.lerp(
            spine006.rotation.x,
            clampedY,
            sensitivity.y
          );
        } else if (window.innerWidth > 1024) {
          spine006.rotation.x = THREE.MathUtils.lerp(spine006.rotation.x, -0.4, 0.03);
          spine006.rotation.y = THREE.MathUtils.lerp(spine006.rotation.y, -0.3, 0.03);
        }
      }

      // Pointlight intensity matches laptop screenlight
      if (screenlightMesh && screenlightMesh.material && screenlightMesh.material.opacity > 0.9) {
        pointLight.intensity = 20 * (screenlightMesh.material.emissiveIntensity || 1);
      } else {
        pointLight.intensity = 0;
      }

      renderer.render(scene, camera);
    };
    reqId = requestAnimationFrame(animate);

    // 8. Responsive resize handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      if (hoverEl) {
        hoverEl.removeEventListener("mouseenter", onMouseEnter);
        hoverEl.removeEventListener("mouseleave", onMouseLeave);
      }
      scrollTriggerCleanups.forEach((cleanup) => cleanup());
      renderer.dispose();
      dracoLoader.dispose();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="character-container">
      <div className="character-model" ref={containerRef}>
        <div className="character-rim" />
        <div className="character-hover" ref={hoverRef} />
      </div>
    </div>
  );
}
