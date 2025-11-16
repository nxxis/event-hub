import React from 'react';

export default function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0" stopColor="#06b6d4" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#g)" />
      <path d="M8 12c1-2 6-2 6 0s-5 2-6 0z" fill="#fff" opacity="0.9" />
    </svg>
  );
}
