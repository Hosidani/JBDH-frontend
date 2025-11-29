import React from "react";

const IconSettings: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = "", style }) => (
  <img
    src="/settings.png"
    alt="Settings"
    className={className}
    style={style}
    width={22}
    height={22}
    draggable={false}
  />
);

export default IconSettings;
