import React, { useState, useEffect } from "react";
import { config } from "../data/config";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PlayGameModal from "./PlayGameModal";

gsap.registerPlugin(ScrollTrigger);

function getWhatsAppUrl(phone, message) {
  if (!phone) return "";
  let digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) {
    digits = "88" + digits;
  }
  const textQuery = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${textQuery}`;
}

export default function Contact() {
  const [isGameOpen, setIsGameOpen] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".contact-section",
        start: "top 90%",
        end: "bottom center",
        toggleActions: "play none none none",
      },
    });

    tl.fromTo(
      ".contact-section h3",
      { opacity: 0, y: 35 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
    );
    tl.fromTo(
      ".contact-box",
      { opacity: 0, y: 35 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" },
      "-=0.3"
    );

    return () => tl.kill();
  }, []);

  return (
    <>
      {/* Signature Dual CTA Buttons */}
      <div className="cta-section">
        <div className="cta-buttons">
          <button
            type="button"
            onClick={() => setIsGameOpen(true)}
            className="cta-btn cta-btn-play"
            data-cursor="disable"
            title="Play Rock Paper Scissors against Eliyas AI Bot"
          >
            Play With Me &rarr;
          </button>
          <a
            href={
              config.social.whatsapp
                ? getWhatsAppUrl(config.social.whatsapp, config.social.whatsappMessage)
                : `mailto:${config.social.email}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="cta-btn cta-btn-hire"
            data-cursor="disable"
            title="Chat on WhatsApp"
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
              {config.social.whatsapp && (
                <a
                  href={getWhatsAppUrl(config.social.whatsapp, config.social.whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="disable"
                  className="contact-social"
                >
                  WhatsApp &#8599;
                </a>
              )}
              {config.developer.resumeUrl && (
                <a
                  href={config.developer.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="disable"
                  className="contact-social"
                >
                  Resume &#8599;
                </a>
              )}
            </div>

            {/* Col 3: Attribution & Copyright */}
            <div className="contact-box contact-author-box">
              <div className="footer-avatar-wrapper">
                <div className="footer-avatar-ring-pulse" />
                <div className="footer-author-avatar">
                  <img
                    src={config.developer.photo || "/images/eliyas.png"}
                    alt={config.developer.fullName}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "/images/eliyas-avatar.png";
                    }}
                  />
                </div>
              </div>
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

      {/* Cyber Duel: Rock Paper Scissors Modal */}
      <PlayGameModal
        isOpen={isGameOpen}
        onClose={() => setIsGameOpen(false)}
      />
    </>
  );
}
