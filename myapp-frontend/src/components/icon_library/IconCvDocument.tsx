import React from "react";
import cvDocumentImg from "../../assets/img/cv-document.png";

const IconCvDocument: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = "", style }) => (
  <img
    src={cvDocumentImg}
    alt="CV dokument"
    className={className}
    style={style}
    width={48}
    height={48}
    draggable={false}
  />
);

export default IconCvDocument;
