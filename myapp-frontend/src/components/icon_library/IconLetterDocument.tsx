import React from "react";

const IconLetterDocument: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = "", style }) => (
  <img
    src="/letter-document.png"
    alt="Personligt brev"
    className={className}
    style={style}
    width={48}
    height={48}
    draggable={false}
  />
);

export default IconLetterDocument;
