import React from "react";
import { config } from "../data/config";
import { Github, Linkedin, Facebook } from "lucide-react";

export default function SocialSidebar() {
  const { github, linkedin, facebook } = config.social;

  return (
    <aside className="social-sidebar" data-cursor="icons">
      {github && (
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub"
          data-cursor="disable"
        >
          <Github size={24} strokeWidth={1.8} />
        </a>
      )}
      {linkedin && (
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          title="LinkedIn"
          data-cursor="disable"
        >
          <Linkedin size={24} strokeWidth={1.8} />
        </a>
      )}
      {facebook && (
        <a
          href={facebook}
          target="_blank"
          rel="noopener noreferrer"
          title="Facebook"
          data-cursor="disable"
        >
          <Facebook size={24} strokeWidth={1.8} />
        </a>
      )}
      <div className="social-sidebar-line" />
    </aside>
  );
}
