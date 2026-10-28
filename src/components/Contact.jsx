import React, { useEffect } from "react";
import { config } from "../data/config";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".contact-section",
        start: "top 80%",
        end: "bottom center",
        toggleActions: "play none none none",
      },
    });

    tl.fromTo(
      ".contact-section h3",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
    tl.fromTo(
      ".contact-box",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power3.out" },
      "-=0.4"
    );

    return () => tl.kill();
  }, []);

  return (
    <>
      {/* Signature Dual CTA Buttons */}
      <div className="cta-section">
        <div className="cta-buttons">
          <a
            href={config.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-btn cta-btn-play"
            data-cursor="disable"
          >
            Play With Me &rarr;
          </a>
          <a
            href={`mailto:${config.social.email}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-btn cta-btn-hire"
            data-cursor="disable"
          >
            Hire Me &rarr;
          </a>
        </div>
      </div>

      {/* Signature 3-Column Typographic Footer Section */}
      <div className="contact-section section-container" id="contact">
        <div className="contact-container">
          <h3>{config.developer.fullName.toUpperCase()}</h3>
          <div className="contact-flex">
            {/* Col 1: Email & Location */}
            <div className="contact-box">
              <h4>Email</h4>
              <p>
                <a href={`mailto:${config.social.email}`} data-cursor="disable">
                  {config.social.email}
                </a>
              </p>
              <h4>Location</h4>
              <p>
                <span>{config.social.location}</span>
              </p>
            </div>

            {/* Col 2: Social Links */}
            <div className="contact-box">
              <h4>Social</h4>
              <a
                href={config.social.github}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="disable"
                className="contact-social"
              >
                Github &#8599;
              </a>
              <a
                href={config.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="disable"
                className="contact-social"
              >
                Linkedin &#8599;
              </a>
              <a
                href={config.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="disable"
                className="contact-social"
              >
                Facebook &#8599;
              </a>
            </div>

            {/* Col 3: Attribution & Copyright */}
            <div className="contact-box">
              <h2>
                Designed and Developed <br />
                by <span>{config.developer.fullName}</span>
              </h2>
              <h5>
                <span>&copy;</span> {new Date().getFullYear()}
              </h5>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
