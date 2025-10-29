import React from "react";

const IconUserLogin = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width="1em"
    height="1em"
    role="img"
    aria-label="User Login"
    className={className}
  >
    <g stroke="currentColor" fill="none" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M192 112 H336 A32 32 0 0 1 368 144 V368 A32 32 0 0 1 336 400 H192" />
      <path d="M320 256 H480 M480 256 L440 296 M480 256 L440 216" />
    </g>
  </svg>
);

export default IconUserLogin;
