import React from "react";
import { Link } from "react-router-dom";
import logo from "../../../assets/logo_inkedin_noir.png";
import logoWhite from "../../../assets/logo_inkedin_blanc.png";

const Logo = ({ theme, size = "default" }) => {
  const sizeClasses = {
    small: "w-18 h-18",
    default: "w-52",
    large: "w-64",
  };

  return (
    <Link to="/">
      <img
        src={theme === "dark" ? logoWhite : logo}
        alt={`logo ${theme === "dark" ? "blanc" : ""} inkediin`}
        className={sizeClasses[size]}
      />
    </Link>
  );
};

export default Logo;
