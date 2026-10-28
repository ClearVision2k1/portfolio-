import React from "react";
import { config } from "../data/config";

export default function Hero() {
  const firstName = config.developer.fullName.split(" ")[0] || "ELIYAS";
  const lastName = config.developer.fullName.split(" ").slice(1).join(" ") || "HASAN";

  return (
    <section className="landing-section" id="landingDiv">
      <div className="landing-container">
        {/* Top-Left: Intro Title */}
        <div className="landing-intro">
          <h2>Hello, I am</h2>
          <h1>
            {firstName.toUpperCase()} <br />
            <span>{lastName.toUpperCase()}</span>
          </h1>
        </div>

        {/* Mobile-Only Portrait Fallback (Hidden on Desktop, Visible on <=768px) */}
        <div className="mobile-photo">
          <img
            src="/images/image.png"
            alt={config.developer.fullName}
            loading="eager"
            fetchPriority="high"
          />
        </div>

        {/* Right: Roles formatted with exact Geist typography & reference style */}
        <div className="landing-info">
          <div className="landing-roles">
            {/* Top Role: Full-Stack Web Developer */}
            <div className="role-block role-block-top">
              <h2>
                <span className="role-line-1">FULL-STACK WEB</span>
                <span className="role-line-2">DEVELOPER</span>
              </h2>
            </div>

            {/* Bottom Role: AI Automation Expert */}
            <div className="role-block role-block-bottom">
              <h2>
                <span className="role-line-1">AI AUTOMATION</span>
                <span className="role-line-2">EXPERT</span>
              </h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
