import React from "react";
import { config } from "../data/config";

export default function About() {
  const paragraphs = config.about.paragraphs || [config.about.description];

  return (
    <section className="about-section" id="about">
      <div className="about-me">
        <h3 className="title">{config.about.title}</h3>
        {paragraphs.map((p, idx) => (
          <p key={idx} className="para">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}
