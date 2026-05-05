import React from "react";
import letterDocumentImg from "../../assets/img/letter-document.png";

const IconLetterDocument: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = "", style }) => (
  <img
    src={letterDocumentImg}
    alt="Personligt brev"
    className={className}
    style={style}
    width={48}
    height={48}
    draggable={false}
  />
);

export default IconLetterDocument;
