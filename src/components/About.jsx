import React from "react";
import { config } from "../data/config";

export default function About() {
  return (
    <section className="about-section" id="about">
      <div className="about-me">
        <h3 className="title">{config.about.title}</h3>
        <p className="para">{config.about.description}</p>
      </div>
    </section>
  );
}
