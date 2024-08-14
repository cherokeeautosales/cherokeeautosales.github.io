import React from 'react';
import './react.scss';
import {
  FaPhoneAlt,
} from "react-icons/fa";

const FloatingButton = () => {
  const handleClick = () => {
    window.location.href = 'tel:(865) 687-7100';
  };

  return (
    <button className="floating-button" onClick={handleClick}>
      <FaPhoneAlt /> 
    </button>
  );
};

export default FloatingButton;
