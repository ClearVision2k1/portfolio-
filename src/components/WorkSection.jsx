import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { config } from "../data/config";
import { getAllProjects, getSynchronousProjects } from "../services/projectService";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function WorkSection() {
  const sectionRef = useRef(null);
  const flexRef = useRef(null);

  // Initialize immediately from localStorage cache or config.projects fallback (0 delay / no flash)
  const [projects, setProjects] = useState(() =>
    getSynchronousProjects().slice(0, 5)
  );

  useEffect(() => {
    let isMounted = true;
    getAllProjects().then((all) => {
      if (isMounted && all && Array.isArray(all)) {
        setProjects(all.slice(0, 5));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 768) return;

    let tl;
    const initScroll = () => {
      const section = sectionRef.current;
      const flex = flexRef.current;
      const boxes = document.querySelectorAll(".work-box");
      const container = document.querySelector(".work-container");

      if (!section || !flex || !boxes.length || !container) return;

      const boxWidth = boxes[0].getBoundingClientRect().width || 440;
      const parentWidth = flex.getBoundingClientRect().width || window.innerWidth;
      const padding = 80;

      // Exact horizontal pin distance calculation ensuring all cards & CTA are fully revealed
      const getScrollDist = () => {
        const b = document.querySelectorAll(".work-box");
        const f = flexRef.current;
        if (!b.length || !f) return 1500;
        const bw = b[0].getBoundingClientRect().width || 440;
        const pw = f.getBoundingClientRect().width || window.innerWidth;
        return Math.max(bw * b.length - pw + padding, 800);
      };

      const scrollDistance = getScrollDist();

      tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${scrollDistance + 600}`,
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          id: "work-pin",
          invalidateOnRefresh: true,
        },
      });

      tl.to(flex, {
        x: () => -getScrollDist(),
        ease: "none",
      });

      ScrollTrigger.refresh();
    };

    // Allow layout and images to paint before measuring
    const timer = setTimeout(initScroll, 120);

    return () => {
      clearTimeout(timer);
      if (tl) tl.kill();
      const st = ScrollTrigger.getById("work-pin");
      if (st) st.kill();
    };
  }, [projects]);

  return (
    <div className="work-section" id="work" ref={sectionRef}>
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>

        <div className="work-flex" ref={flexRef}>
          {projects.map((project, idx) => (
            <div key={project.id || idx} className="work-box">
              {/* Project Thumbnail on TOP - Clicking opens Project Detail */}
              <div className="work-image">
                <Link
                  className="work-image-in"
                  to={`/project/${project.id}`}
                  data-cursor="disable"
                  title={`View ${project.title} details`}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="work-link">
                    <ArrowUpRight size={18} />
                  </div>
                </Link>
              </div>

              {/* Work info below thumbnail */}
              <div className="work-info">
                <div className="work-title">
                  <h3>0{idx + 1}</h3>
                  <div>
                    <Link
                      to={`/project/${project.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <h4>{project.title}</h4>
                    </Link>
                    <p>{project.category}</p>
                  </div>
                </div>

                <h4>Tools and features</h4>
                <p>{project.technologies || project.description}</p>
              </div>
            </div>
          ))}

          {/* Final CTA Card matching reference site */}
          <div className="work-box work-box-cta">
            <div className="see-all-works">
              <h3>Want to see more?</h3>
              <p>Explore all of my projects and creations</p>
              <Link
                to="/myworks"
                className="see-all-btn"
                data-cursor="disable"
              >
                See All Works
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
