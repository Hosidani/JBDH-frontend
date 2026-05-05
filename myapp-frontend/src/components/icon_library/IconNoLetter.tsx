import React from "react";
import noLetterImg from "../../assets/img/no-letter.png";

const IconNoLetter: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = "", style }) => (
  <img
    src={noLetterImg}
    alt="Inget brev"
    className={className}
    style={style}
    width={48}
    height={48}
    draggable={false}
  />
);

export default IconNoLetter;
