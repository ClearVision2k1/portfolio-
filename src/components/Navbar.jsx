import React, { useState, useEffect } from "react";
import { config } from "../data/config";

// Dual-layer vertical sliding hover text component (Exact reference implementation)
const HoverLink = ({ text }) => (
  <div className="hover-link" data-cursor="disable">
    <div className="hover-in">
      {text}
      <div>{text}</div>
    </div>
  </div>
);

export default function Navbar({ onRestartLoader }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`header ${scrolled ? "header-scrolled" : ""}`}>
        {/* Left: Small Circular Profile Avatar */}
        <a
          href="/#"
          className="navbar-title navbar-avatar-link"
          data-cursor="disable"
          title={config.developer.fullName}
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "instant" });
            if (onRestartLoader) onRestartLoader();
          }}
        >
          <div className="navbar-avatar-frame">
            <img
              src="/images/eliyas-avatar.png"
              alt={config.developer.fullName}
              className="navbar-avatar-img"
            />
          </div>
        </a>

        {/* Center / Middle: Direct Contact Email with signature motion & color change */}
        <a
          href={`mailto:${config.social.email}`}
          className="navbar-connect"
          data-cursor="disable"
        >
          <HoverLink text={config.social.email} />
        </a>

        {/* Right: Signature Sliding Hover Navigation Links (Exact 3 links matching reference) */}
        <ul>
          <li>
            <a href="#about" data-href="#about" data-cursor="disable">
              <HoverLink text="ABOUT" />
            </a>
          </li>
          <li>
            <a href="#work" data-href="#work" data-cursor="disable">
              <HoverLink text="WORK" />
            </a>
          </li>
          <li>
            <a href="#contact" data-href="#contact" data-cursor="disable">
              <HoverLink text="CONTACT" />
            </a>
          </li>
        </ul>
      </header>

      {/* Top gradient fade */}
      <div className="nav-fade" />
    </>
  );
}
