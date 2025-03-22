import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  onClick, 
  disabled = false,
  isLoading = false 
}) => {
  return (
    <button
      type={type}
      className={`custom-button ${variant} ${isLoading ? 'loading' : ''}`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <span className="spinner"></span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;