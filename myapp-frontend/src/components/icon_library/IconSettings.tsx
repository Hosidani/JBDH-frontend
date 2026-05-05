import React from "react";
import settingsImg from "../../assets/img/settings.png";

const IconSettings: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = "", style }) => (
  <img
    src={settingsImg}
    alt="Settings"
    className={className}
    style={style}
    width={22}
    height={22}
    draggable={false}
  />
);

export default IconSettings;
