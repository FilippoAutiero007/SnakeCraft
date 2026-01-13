
import React from 'react';

export const ChocolateIcon = ({ className, size = 24 }: { className?: string, size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className} 
    xmlns="http://www.w3.org/2000/svg"
    style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.3))' }}
  >
    <rect x="5" y="2" width="14" height="20" rx="2" fill="#5D4037" />
    <rect x="5" y="2" width="14" height="20" rx="2" fill="url(#gradChoco)" fillOpacity="0.4" />
    
    <path d="M5 8H19" stroke="#3E2723" strokeWidth="1" />
    <path d="M5 14H19" stroke="#3E2723" strokeWidth="1" />
    <path d="M12 2V22" stroke="#3E2723" strokeWidth="1" />

    <path d="M5 13L7 12L9 13L11 12L13 13L15 12L17 13L19 12V16H5V13Z" fill="#B0BEC5" />

    <path d="M5 15L7 14L9 15L11 14L13 15L15 14L17 15L19 14V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V15Z" fill="#C62828" />
    
    <defs>
      <linearGradient id="gradChoco" x1="5" y1="2" x2="19" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8D6E63"/>
        <stop offset="1" stopColor="#3E2723"/>
      </linearGradient>
    </defs>
  </svg>
);
