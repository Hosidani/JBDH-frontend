import React from "react";

const IconUserRegister = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width="1em"
    height="1em"
    role="img"
    aria-label="User Register"
    className={className}
  >
    <g stroke="currentColor" fill="none" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="176" cy="200" r="64" />
      <path d="M304 240 L480 240" />
      <path d="M392 160 L392 320" />
      <path d="M112 368 C144 304 320 304 352 368 Z" />
    </g>
  </svg>
);

export default IconUserRegister;
