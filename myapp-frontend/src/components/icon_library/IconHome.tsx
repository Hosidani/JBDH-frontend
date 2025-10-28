import React from "react";

const IconHome = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width="1em"
    height="1em"
    role="img"
    aria-label="Home"
    className={className}
  >
    <g stroke="currentColor" fill="none" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M80 260 L256 120 L432 260 V420 H320 V320 H192 V420 H80 Z" />
    </g>
  </svg>
);

export default IconHome;
