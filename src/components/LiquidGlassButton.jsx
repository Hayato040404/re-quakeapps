import React from 'react';
import LiquidGlass from 'liquid-glass-react';
import './LiquidGlassButton.css';

const LiquidGlassButton = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  return (
    <button
      className={`liquid-glass-btn ${variant} ${className}`}
      onClick={onClick}
      {...props}
    >
      <LiquidGlass
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '8px',
          opacity: 0.3,
        }}
      />
      <span className="button-content">{children}</span>
    </button>
  );
};

export default LiquidGlassButton;
