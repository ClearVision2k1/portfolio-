import React, { useEffect, useRef } from "react";
import { config } from "../data/config";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CareerTimeline() {
  const sectionRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const timeline = timelineRef.current;
    if (!section || !timeline) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          end: "bottom 30%",
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        timeline,
        { maxHeight: "0%", opacity: 0 },
        { maxHeight: "100%", opacity: 1, duration: 1, ease: "none" },
        0
      );

      tl.fromTo(
        ".career-info-box",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.2, duration: 0.8, ease: "power2.out" },
        0.1
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <div className="career-section section-container" id="experience" ref={sectionRef}>
      <div className="career-container">
        <h2>
          My career <span>&amp;</span>
          <br /> experience
        </h2>

        <div className="career-info">
          {/* Central Animated Gradient Line with Pulsating Dot */}
          <div className="career-timeline" ref={timelineRef}>
            <div className="career-dot" />
          </div>

          {/* Timeline Boxes */}
          {config.experiences.map((item, idx) => (
            <div className="career-info-box" key={idx}>
              {/* Left Column: Role, Company & Year */}
              <div className="career-info-in">
                <div className="career-role">
                  <h4>{item.position}</h4>
                  <h5>{item.company}</h5>
                </div>
                <h3>{item.yearDisplay}</h3>
              </div>

              {/* Right Column: Description & Clean Styled Tags */}
              <div className="career-info-desc">
                <p>{item.description}</p>
                {item.technologies && item.technologies.length > 0 && (
                  <div className="career-tech-tags">
                    {item.technologies.map((tech, tIdx) => (
                      <span key={tIdx} className="career-tech-pill">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
