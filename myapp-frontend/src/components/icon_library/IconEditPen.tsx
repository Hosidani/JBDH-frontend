import React from "react";
import editPenImg from "../../assets/img/edit_pen.svg";

const IconEditPen: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = "", style }) => (
  <img
    src={editPenImg}
    alt="Edit"
    className={className}
    style={style}
    width={18}
    height={18}
    draggable={false}
  />
);

export default IconEditPen;
