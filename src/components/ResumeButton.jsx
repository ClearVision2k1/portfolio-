import React from "react";
import { config } from "../data/config";
import { FileText } from "lucide-react";

export default function ResumeButton() {
  return (
    <a
      className="resume-button"
      href={config.developer.resumeUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="disable"
    >
      <span className="resume-text">RESUME</span>
      <span className="resume-icon">
        <FileText size={17} />
      </span>
    </a>
  );
}
