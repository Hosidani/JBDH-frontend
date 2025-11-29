import React from "react";

const IconNoLetter: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = "", style }) => (
  <img
    src="/no-letter.png"
    alt="Inget brev"
    className={className}
    style={style}
    width={48}
    height={48}
    draggable={false}
  />
);

export default IconNoLetter;
