import React, { useEffect, useRef } from 'react';
import LiquidGlass from 'liquid-glass-react';
import './LiquidGlassButton.css';

const LiquidGlassButton = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const buttonRef = useRef(null);
  const glassRef = useRef(null);

  useEffect(() => {
    // LiquidGlassが正しくマウントされるのを確認
    if (glassRef.current) {
      console.log('LiquidGlass mounted:', glassRef.current);
    }
  }, []);

  return (
    <button
      ref={buttonRef}
      className={`liquid-glass-btn ${variant} ${className}`}
      onClick={onClick}
      {...props}
    >
      <div 
        ref={glassRef}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '8px',
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <LiquidGlass
          style={{
            width: '100%',
            height: '100%',
            opacity: 0.6,
          }}
        />
      </div>
      <span className="button-content">{children}</span>
    </button>
  );
};

export default LiquidGlassButton;
