import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { config } from "../data/config";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function WorkSection() {
  const sectionRef = useRef(null);
  const flexRef = useRef(null);

  // Home section features the 5 personal showcased projects
  const featuredProjects = config.projects.filter((p) => p.featured !== false).slice(0, 5);

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
  }, []);

  return (
    <div className="work-section" id="work" ref={sectionRef}>
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>

        <div className="work-flex" ref={flexRef}>
          {featuredProjects.map((project, idx) => (
            <div key={project.id} className="work-box">
              {/* Top/Bottom alternating: work-info first */}
              <div className="work-info">
                <div className="work-title">
                  <h3>0{idx + 1}</h3>
                  <div>
                    <h4>{project.title}</h4>
                    <p>{project.category}</p>
                  </div>
                </div>

                <h4>Tools and features</h4>
                <p>{project.technologies || project.description}</p>
              </div>

              {/* Work image container */}
              <div className="work-image">
                <a
                  className="work-image-in"
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="disable"
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
                </a>
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
