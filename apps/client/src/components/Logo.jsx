import React from 'react';

export default function Logo({ size = 36 }) {
  // Use a bold two-stop gradient for the logo that matches theme
  const primaryHex = '#06b6d4';
  const secondaryHex = '#7c3aed';
  const dark = '#07122a';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0" stopColor={primaryHex} />
          <stop offset="1" stopColor={secondaryHex} />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="12" fill="url(#g)" />
      <g transform="translate(8,8)">
        <circle cx="24" cy="24" r="18" fill="rgba(255,255,255,0.12)" />
        <path
          d="M14 34v-4.8c0-2.2 1.9-4 4.2-4h3.6c2.3 0 4.2 1.8 4.2 4V34"
          stroke={dark}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13 20c2-3.5 5.8-6 11-6 6 0 9 3 11 6"
          stroke={dark}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
