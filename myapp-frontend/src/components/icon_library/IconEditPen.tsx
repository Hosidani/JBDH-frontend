import React from "react";

const IconEditPen: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = "", style }) => (
  <img
    src="/edit_pen.svg"
    alt="Edit"
    className={className}
    style={style}
    width={18}
    height={18}
    draggable={false}
  />
);

export default IconEditPen;
