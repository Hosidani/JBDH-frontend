import React from "react";

const IconCvDocument: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = "", style }) => (
  <img
    src="/cv-document.png"
    alt="CV dokument"
    className={className}
    style={style}
    width={48}
    height={48}
    draggable={false}
  />
);

export default IconCvDocument;
