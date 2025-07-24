import React from 'react';

export default function Spinner({ size = 40, color = 'red', style = {} }) {
  return (
    <div
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        ...style,
      }}
      aria-label="Loading"
      role="status"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: 'block' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size / 2) - 4}
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeDasharray={Math.PI * (size - 8)}
          strokeDashoffset={Math.PI * (size - 8) * 0.25}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${size / 2} ${size / 2}`}
            to={`360 ${size / 2} ${size / 2}`}
            dur="0.8s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
} 