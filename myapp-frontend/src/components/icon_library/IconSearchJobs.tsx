import React from "react";

const IconSearchJobs = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width="1em"
    height="1em"
    role="img"
    aria-label="Search Jobs"
    className={className}
  >
    <g stroke="currentColor" fill="none" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="220" cy="200" r="96" />
      <path d="M310 310 L420 420" />
    </g>
  </svg>
);

export default IconSearchJobs;
