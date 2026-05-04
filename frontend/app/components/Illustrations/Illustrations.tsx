// @AI-HINT: Shared purposeful SVG illustrations for hero sections across the platform.
// Style follows the Blog hero pattern: clean inline SVGs, brand colors, animated floating elements.
// Colors: Primary #4573df, Orange #ff9800, Green #27AE60, Red #e81123, Secondary #6b93e8
'use client';

import React from 'react';

/* ------------------------------------------------------------------ */
/*  About Page — Connected globe with nodes & data flow               */
/* ------------------------------------------------------------------ */
export const AboutIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 520 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Globe */}
    <circle cx="260" cy="190" r="110" fill="url(#aboutGlobe)" opacity="0.12" />
    <ellipse cx="260" cy="190" rx="110" ry="40" fill="none" stroke="#4573df" strokeWidth="1.5" opacity="0.15" />
    <ellipse cx="260" cy="190" rx="80" ry="110" fill="none" stroke="#4573df" strokeWidth="1.5" opacity="0.12" />
    <ellipse cx="260" cy="190" rx="110" ry="70" fill="none" stroke="#6b93e8" strokeWidth="1" opacity="0.1" transform="rotate(30 260 190)" />
    {/* Connection nodes */}
    <circle cx="180" cy="140" r="8" fill="#4573df" opacity="0.35">
      <animate attributeName="r" values="8;10;8" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="340" cy="160" r="7" fill="#ff9800" opacity="0.35">
      <animate attributeName="r" values="7;9;7" dur="3.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="290" cy="100" r="6" fill="#27AE60" opacity="0.35">
      <animate attributeName="r" values="6;8;6" dur="4s" repeatCount="indefinite" />
    </circle>
    <circle cx="220" cy="260" r="7" fill="#6b93e8" opacity="0.3">
      <animate attributeName="r" values="7;9;7" dur="3.2s" repeatCount="indefinite" />
    </circle>
    <circle cx="330" cy="240" r="6" fill="#e81123" opacity="0.3">
      <animate attributeName="r" values="6;8;6" dur="2.8s" repeatCount="indefinite" />
    </circle>
    {/* Connection lines */}
    <line x1="180" y1="140" x2="290" y2="100" stroke="#4573df" strokeWidth="1" opacity="0.15">
      <animate attributeName="opacity" values="0.15;0.3;0.15" dur="4s" repeatCount="indefinite" />
    </line>
    <line x1="290" y1="100" x2="340" y2="160" stroke="#ff9800" strokeWidth="1" opacity="0.12">
      <animate attributeName="opacity" values="0.12;0.25;0.12" dur="3.5s" repeatCount="indefinite" />
    </line>
    <line x1="340" y1="160" x2="330" y2="240" stroke="#6b93e8" strokeWidth="1" opacity="0.12">
      <animate attributeName="opacity" values="0.12;0.25;0.12" dur="5s" repeatCount="indefinite" />
    </line>
    <line x1="180" y1="140" x2="220" y2="260" stroke="#27AE60" strokeWidth="1" opacity="0.12">
      <animate attributeName="opacity" values="0.12;0.25;0.12" dur="4.5s" repeatCount="indefinite" />
    </line>
    {/* Data packets traveling along lines */}
    <circle r="3" fill="#4573df" opacity="0.5">
      <animateMotion path="M180,140 L290,100" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle r="3" fill="#ff9800" opacity="0.5">
      <animateMotion path="M340,160 L290,100" dur="2.5s" repeatCount="indefinite" />
    </circle>
    {/* Floating decorations */}
    <rect x="80" y="90" width="22" height="22" rx="5" fill="#27AE60" opacity="0.1" transform="rotate(20 91 101)">
      <animateTransform attributeName="transform" type="rotate" from="20 91 101" to="380 91 101" dur="22s" repeatCount="indefinite" />
    </rect>
    <circle cx="440" cy="120" r="18" fill="#4573df" opacity="0.08">
      <animate attributeName="cy" values="120;105;120" dur="4s" repeatCount="indefinite" />
    </circle>
    <polygon points="450,280 462,260 474,280" fill="#ff9800" opacity="0.1">
      <animate attributeName="opacity" values="0.1;0.2;0.1" dur="5s" repeatCount="indefinite" />
    </polygon>
    {/* Base platform */}
    <rect x="180" y="320" width="160" height="6" rx="3" fill="currentColor" opacity="0.06" />
    <defs>
      <radialGradient id="aboutGlobe" cx="50%" cy="40%" r="60%">
        <stop stopColor="#4573df" />
        <stop offset="1" stopColor="#6b93e8" stopOpacity="0.3" />
      </radialGradient>
    </defs>
  </svg>
);

/* ------------------------------------------------------------------ */
/*  FAQ Page — Question-mark with branching answer paths               */
/* ------------------------------------------------------------------ */
export const FAQIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 520 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Large question mark shape */}
    <path d="M230 90 Q230 60 260 60 Q310 60 310 110 Q310 140 270 150 L270 180" stroke="url(#faqGrad)" strokeWidth="16" strokeLinecap="round" fill="none" opacity="0.2" />
    <circle cx="270" cy="210" r="10" fill="#4573df" opacity="0.2" />
    {/* Answer cards fanning out */}
    <rect x="130" y="240" width="120" height="70" rx="10" fill="url(#faqCard1)" opacity="0.12" transform="rotate(-5 190 275)">
      <animate attributeName="opacity" values="0.12;0.18;0.12" dur="4s" repeatCount="indefinite" />
    </rect>
    <rect x="152" y="258" width="60" height="6" rx="3" fill="#4573df" opacity="0.3" transform="rotate(-5 182 261)" />
    <rect x="152" y="272" width="80" height="4" rx="2" fill="currentColor" opacity="0.1" transform="rotate(-5 192 274)" />
    <rect x="152" y="282" width="70" height="4" rx="2" fill="currentColor" opacity="0.08" transform="rotate(-5 187 284)" />
    <rect x="270" y="240" width="120" height="70" rx="10" fill="url(#faqCard2)" opacity="0.12" transform="rotate(5 330 275)">
      <animate attributeName="opacity" values="0.12;0.18;0.12" dur="4.5s" repeatCount="indefinite" />
    </rect>
    <rect x="292" y="258" width="60" height="6" rx="3" fill="#ff9800" opacity="0.3" transform="rotate(5 322 261)" />
    <rect x="292" y="272" width="80" height="4" rx="2" fill="currentColor" opacity="0.1" transform="rotate(5 332 274)" />
    <rect x="292" y="282" width="70" height="4" rx="2" fill="currentColor" opacity="0.08" transform="rotate(5 327 284)" />
    {/* Floating shapes */}
    <circle cx="90" cy="130" r="20" fill="#6b93e8" opacity="0.1">
      <animate attributeName="cy" values="130;115;130" dur="3.5s" repeatCount="indefinite" />
    </circle>
    <rect x="420" y="100" width="24" height="24" rx="5" fill="#27AE60" opacity="0.1" transform="rotate(15 432 112)">
      <animateTransform attributeName="transform" type="rotate" from="15 432 112" to="375 432 112" dur="20s" repeatCount="indefinite" />
    </rect>
    <circle cx="440" cy="260" r="14" fill="#ff9800" opacity="0.12">
      <animate attributeName="cy" values="260;248;260" dur="4s" repeatCount="indefinite" />
    </circle>
    <polygon points="80,300 93,278 106,300" fill="#e81123" opacity="0.1">
      <animate attributeName="opacity" values="0.1;0.2;0.1" dur="5s" repeatCount="indefinite" />
    </polygon>
    {/* Connecting lines from ? to cards */}
    <line x1="260" y1="210" x2="190" y2="245" stroke="#4573df" strokeWidth="1.5" opacity="0.1" strokeDasharray="4 4">
      <animate attributeName="opacity" values="0.1;0.2;0.1" dur="3s" repeatCount="indefinite" />
    </line>
    <line x1="280" y1="210" x2="330" y2="245" stroke="#ff9800" strokeWidth="1.5" opacity="0.1" strokeDasharray="4 4">
      <animate attributeName="opacity" values="0.1;0.2;0.1" dur="3.5s" repeatCount="indefinite" />
    </line>
    <defs>
      <linearGradient id="faqGrad" x1="230" y1="60" x2="310" y2="180">
        <stop stopColor="#4573df" />
        <stop offset="1" stopColor="#6b93e8" />
      </linearGradient>
      <linearGradient id="faqCard1" x1="130" y1="240" x2="250" y2="310">
        <stop stopColor="#4573df" />
        <stop offset="1" stopColor="#6b93e8" />
      </linearGradient>
      <linearGradient id="faqCard2" x1="270" y1="240" x2="390" y2="310">
        <stop stopColor="#ff9800" />
        <stop offset="1" stopColor="#ffb74d" />
      </linearGradient>
    </defs>
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Contact Page — Envelope with sending animation                     */
/* ------------------------------------------------------------------ */
export const ContactIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 520 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Envelope body */}
    <rect x="140" y="130" width="240" height="160" rx="14" fill="url(#contactEnvGrad)" opacity="0.14" />
    {/* Envelope flap */}
    <path d="M140 145 L260 230 L380 145" stroke="#4573df" strokeWidth="2" fill="none" opacity="0.2" />
    {/* Letter peeking out */}
    <rect x="170" y="100" width="180" height="110" rx="8" fill="url(#contactLetterGrad)" opacity="0.1">
      <animate attributeName="y" values="100;90;100" dur="4s" repeatCount="indefinite" />
    </rect>
    {/* Letter content lines */}
    <rect x="195" y="118" width="100" height="8" rx="4" fill="#4573df" opacity="0.25">
      <animate attributeName="y" values="118;108;118" dur="4s" repeatCount="indefinite" />
    </rect>
    <rect x="195" y="134" width="130" height="5" rx="2.5" fill="currentColor" opacity="0.1">
      <animate attributeName="y" values="134;124;134" dur="4s" repeatCount="indefinite" />
    </rect>
    <rect x="195" y="146" width="110" height="5" rx="2.5" fill="currentColor" opacity="0.08">
      <animate attributeName="y" values="146;136;146" dur="4s" repeatCount="indefinite" />
    </rect>
    {/* Send wave pulses */}
    <circle cx="260" cy="210" r="40" fill="none" stroke="#4573df" strokeWidth="1" opacity="0.08">
      <animate attributeName="r" values="40;80;40" dur="3s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.12;0;0.12" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="260" cy="210" r="30" fill="none" stroke="#6b93e8" strokeWidth="1" opacity="0.08">
      <animate attributeName="r" values="30;70;30" dur="3s" repeatCount="indefinite" begin="0.5s" />
      <animate attributeName="opacity" values="0.12;0;0.12" dur="3s" repeatCount="indefinite" begin="0.5s" />
    </circle>
    {/* Chat bubbles */}
    <rect x="380" y="100" width="80" height="40" rx="12" fill="#27AE60" opacity="0.1">
      <animate attributeName="opacity" values="0.1;0.18;0.1" dur="5s" repeatCount="indefinite" />
    </rect>
    <rect x="395" y="112" width="50" height="5" rx="2.5" fill="#27AE60" opacity="0.2" />
    <rect x="395" y="122" width="35" height="4" rx="2" fill="#27AE60" opacity="0.15" />
    <rect x="60" y="200" width="70" height="35" rx="10" fill="#ff9800" opacity="0.1">
      <animate attributeName="opacity" values="0.1;0.18;0.1" dur="4.5s" repeatCount="indefinite" />
    </rect>
    <rect x="73" y="212" width="44" height="4" rx="2" fill="#ff9800" opacity="0.2" />
    <rect x="73" y="220" width="30" height="3" rx="1.5" fill="#ff9800" opacity="0.15" />
    {/* Floating shapes */}
    <circle cx="80" cy="110" r="16" fill="#4573df" opacity="0.1">
      <animate attributeName="cy" values="110;98;110" dur="3.5s" repeatCount="indefinite" />
    </circle>
    <rect x="430" y="250" width="22" height="22" rx="5" fill="#e81123" opacity="0.09" transform="rotate(20 441 261)">
      <animateTransform attributeName="transform" type="rotate" from="20 441 261" to="380 441 261" dur="22s" repeatCount="indefinite" />
    </rect>
    <polygon points="100,330 112,310 124,330" fill="#27AE60" opacity="0.1">
      <animate attributeName="opacity" values="0.1;0.2;0.1" dur="5s" repeatCount="indefinite" />
    </polygon>
    <defs>
      <linearGradient id="contactEnvGrad" x1="140" y1="130" x2="380" y2="290">
        <stop stopColor="#4573df" />
        <stop offset="1" stopColor="#6b93e8" />
      </linearGradient>
      <linearGradient id="contactLetterGrad" x1="170" y1="100" x2="350" y2="210">
        <stop stopColor="#4573df" />
        <stop offset="1" stopColor="#ff9800" />
      </linearGradient>
    </defs>
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Pricing Page — Tier cards with coin / value stack                  */
/* ------------------------------------------------------------------ */
export const PricingIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 520 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Three tier columns rising */}
    {/* Basic */}
    <rect x="110" y="200" width="80" height="120" rx="10" fill="url(#priceTier1)" opacity="0.1" />
    <rect x="125" y="220" width="50" height="6" rx="3" fill="#6b93e8" opacity="0.25" />
    <rect x="125" y="234" width="40" height="4" rx="2" fill="currentColor" opacity="0.08" />
    <rect x="125" y="244" width="45" height="4" rx="2" fill="currentColor" opacity="0.06" />
    <circle cx="150" cy="280" r="14" fill="#6b93e8" opacity="0.12" />
    <text x="150" y="285" textAnchor="middle" fill="#4573df" fontSize="12" fontWeight="600" opacity="0.35">$</text>
    {/* Standard (tallest - popular) */}
    <rect x="220" y="140" width="80" height="180" rx="10" fill="url(#priceTier2)" opacity="0.14" />
    <rect x="235" y="160" width="50" height="6" rx="3" fill="#4573df" opacity="0.35" />
    <rect x="235" y="174" width="40" height="4" rx="2" fill="currentColor" opacity="0.1" />
    <rect x="235" y="184" width="45" height="4" rx="2" fill="currentColor" opacity="0.08" />
    <rect x="235" y="194" width="38" height="4" rx="2" fill="currentColor" opacity="0.06" />
    {/* Star badge on popular */}
    <circle cx="280" cy="140" r="14" fill="#ff9800" opacity="0.2">
      <animate attributeName="r" values="14;16;14" dur="3s" repeatCount="indefinite" />
    </circle>
    <text x="280" y="145" textAnchor="middle" fill="#ff9800" fontSize="14" opacity="0.5">★</text>
    <circle cx="260" cy="280" r="14" fill="#4573df" opacity="0.15" />
    <text x="260" y="285" textAnchor="middle" fill="#4573df" fontSize="12" fontWeight="600" opacity="0.4">$</text>
    {/* Premium */}
    <rect x="330" y="170" width="80" height="150" rx="10" fill="url(#priceTier3)" opacity="0.12" />
    <rect x="345" y="190" width="50" height="6" rx="3" fill="#27AE60" opacity="0.3" />
    <rect x="345" y="204" width="40" height="4" rx="2" fill="currentColor" opacity="0.08" />
    <rect x="345" y="214" width="45" height="4" rx="2" fill="currentColor" opacity="0.06" />
    <circle cx="370" cy="280" r="14" fill="#27AE60" opacity="0.12" />
    <text x="370" y="285" textAnchor="middle" fill="#27AE60" fontSize="12" fontWeight="600" opacity="0.4">$</text>
    {/* Coins floating up */}
    <circle cx="150" cy="180" r="10" fill="#ff9800" opacity="0.15">
      <animate attributeName="cy" values="180;165;180" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="370" cy="150" r="8" fill="#ff9800" opacity="0.12">
      <animate attributeName="cy" values="150;138;150" dur="3.5s" repeatCount="indefinite" />
    </circle>
    {/* Floating decorations */}
    <circle cx="70" cy="140" r="18" fill="#4573df" opacity="0.08">
      <animate attributeName="cy" values="140;125;140" dur="4s" repeatCount="indefinite" />
    </circle>
    <rect x="440" y="100" width="24" height="24" rx="5" fill="#27AE60" opacity="0.09" transform="rotate(15 452 112)">
      <animateTransform attributeName="transform" type="rotate" from="15 452 112" to="375 452 112" dur="20s" repeatCount="indefinite" />
    </rect>
    <polygon points="70,300 82,280 94,300" fill="#e81123" opacity="0.08">
      <animate attributeName="opacity" values="0.08;0.16;0.08" dur="5s" repeatCount="indefinite" />
    </polygon>
    {/* Base */}
    <rect x="100" y="330" width="320" height="6" rx="3" fill="currentColor" opacity="0.05" />
    <defs>
      <linearGradient id="priceTier1" x1="110" y1="200" x2="190" y2="320">
        <stop stopColor="#6b93e8" />
        <stop offset="1" stopColor="#4573df" />
      </linearGradient>
      <linearGradient id="priceTier2" x1="220" y1="140" x2="300" y2="320">
        <stop stopColor="#4573df" />
        <stop offset="1" stopColor="#6b93e8" />
      </linearGradient>
      <linearGradient id="priceTier3" x1="330" y1="170" x2="410" y2="320">
        <stop stopColor="#27AE60" />
        <stop offset="1" stopColor="#2ecc71" />
      </linearGradient>
    </defs>
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Status Page — Server rack with health pulse                        */
/* ------------------------------------------------------------------ */
export const StatusIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 520 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Server rack frame */}
    <rect x="170" y="70" width="180" height="260" rx="14" fill="url(#statusRackGrad)" opacity="0.1" />
    {/* Server units */}
    <rect x="190" y="90" width="140" height="40" rx="6" fill="#4573df" opacity="0.1" />
    <circle cx="210" cy="110" r="6" fill="#27AE60" opacity="0.5">
      <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite" />
    </circle>
    <rect x="225" y="104" width="60" height="5" rx="2.5" fill="currentColor" opacity="0.1" />
    <rect x="225" y="114" width="45" height="4" rx="2" fill="currentColor" opacity="0.07" />
    <rect x="190" y="145" width="140" height="40" rx="6" fill="#4573df" opacity="0.1" />
    <circle cx="210" cy="165" r="6" fill="#27AE60" opacity="0.5">
      <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2.3s" repeatCount="indefinite" />
    </circle>
    <rect x="225" y="159" width="60" height="5" rx="2.5" fill="currentColor" opacity="0.1" />
    <rect x="225" y="169" width="50" height="4" rx="2" fill="currentColor" opacity="0.07" />
    <rect x="190" y="200" width="140" height="40" rx="6" fill="#4573df" opacity="0.1" />
    <circle cx="210" cy="220" r="6" fill="#27AE60" opacity="0.5">
      <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2.6s" repeatCount="indefinite" />
    </circle>
    <rect x="225" y="214" width="55" height="5" rx="2.5" fill="currentColor" opacity="0.1" />
    <rect x="225" y="224" width="42" height="4" rx="2" fill="currentColor" opacity="0.07" />
    <rect x="190" y="255" width="140" height="40" rx="6" fill="#4573df" opacity="0.1" />
    <circle cx="210" cy="275" r="6" fill="#ff9800" opacity="0.5">
      <animate attributeName="opacity" values="0.5;0.8;0.5" dur="1.8s" repeatCount="indefinite" />
    </circle>
    <rect x="225" y="269" width="60" height="5" rx="2.5" fill="currentColor" opacity="0.1" />
    <rect x="225" y="279" width="48" height="4" rx="2" fill="currentColor" opacity="0.07" />
    {/* Heart-beat line */}
    <polyline points="60,200 100,200 120,200 135,170 150,230 165,190 180,200 400,200 420,200 440,170 455,230 470,200"
      stroke="#27AE60" strokeWidth="2" fill="none" opacity="0.2" strokeLinecap="round" strokeLinejoin="round">
      <animate attributeName="opacity" values="0.2;0.35;0.2" dur="2s" repeatCount="indefinite" />
    </polyline>
    {/* Floating shapes */}
    <circle cx="80" cy="110" r="18" fill="#4573df" opacity="0.08">
      <animate attributeName="cy" values="110;98;110" dur="3.5s" repeatCount="indefinite" />
    </circle>
    <rect x="420" y="90" width="24" height="24" rx="5" fill="#ff9800" opacity="0.09" transform="rotate(12 432 102)">
      <animateTransform attributeName="transform" type="rotate" from="12 432 102" to="372 432 102" dur="22s" repeatCount="indefinite" />
    </rect>
    <polygon points="430,300 442,282 454,300" fill="#e81123" opacity="0.08">
      <animate attributeName="opacity" values="0.08;0.16;0.08" dur="5s" repeatCount="indefinite" />
    </polygon>
    <circle cx="450" cy="200" r="12" fill="#6b93e8" opacity="0.1">
      <animate attributeName="cy" values="200;190;200" dur="4s" repeatCount="indefinite" />
    </circle>
    {/* Base */}
    <rect x="200" y="345" width="120" height="6" rx="3" fill="currentColor" opacity="0.05" />
    <defs>
      <linearGradient id="statusRackGrad" x1="170" y1="70" x2="350" y2="330">
        <stop stopColor="#4573df" />
        <stop offset="1" stopColor="#6b93e8" />
      </linearGradient>
    </defs>
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Login Page — Secure shield with user profile                       */
/* ------------------------------------------------------------------ */
export const LoginIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 400 360" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Shield outline */}
    <path d="M200 50 L310 90 Q320 200 200 310 Q80 200 90 90 Z" fill="url(#loginShieldGrad)" opacity="0.1" />
    <path d="M200 50 L310 90 Q320 200 200 310 Q80 200 90 90 Z" stroke="#4573df" strokeWidth="2" fill="none" opacity="0.15" />
    {/* User silhouette inside shield */}
    <circle cx="200" cy="150" r="28" fill="#4573df" opacity="0.15" />
    <ellipse cx="200" cy="210" rx="40" ry="25" fill="#4573df" opacity="0.1" />
    {/* Lock icon */}
    <rect x="186" y="235" width="28" height="22" rx="4" fill="#ff9800" opacity="0.2" />
    <path d="M192 235 L192 225 Q192 215 200 215 Q208 215 208 225 L208 235" stroke="#ff9800" strokeWidth="2.5" fill="none" opacity="0.25" />
    <circle cx="200" cy="246" r="3" fill="#ff9800" opacity="0.35" />
    {/* Verified checkmarks */}
    <circle cx="130" cy="130" r="12" fill="#27AE60" opacity="0.15">
      <animate attributeName="opacity" values="0.15;0.25;0.15" dur="3s" repeatCount="indefinite" />
    </circle>
    <path d="M125 130 L128 133 L135 126" stroke="#27AE60" strokeWidth="2" fill="none" opacity="0.4" />
    <circle cx="270" cy="130" r="12" fill="#27AE60" opacity="0.15">
      <animate attributeName="opacity" values="0.15;0.25;0.15" dur="3.5s" repeatCount="indefinite" />
    </circle>
    <path d="M265 130 L268 133 L275 126" stroke="#27AE60" strokeWidth="2" fill="none" opacity="0.4" />
    {/* Floating elements */}
    <circle cx="55" cy="90" r="14" fill="#6b93e8" opacity="0.1">
      <animate attributeName="cy" values="90;78;90" dur="3.5s" repeatCount="indefinite" />
    </circle>
    <rect x="340" y="70" width="20" height="20" rx="4" fill="#27AE60" opacity="0.08" transform="rotate(15 350 80)">
      <animateTransform attributeName="transform" type="rotate" from="15 350 80" to="375 350 80" dur="20s" repeatCount="indefinite" />
    </rect>
    <polygon points="55,280 66,260 77,280" fill="#e81123" opacity="0.08">
      <animate attributeName="opacity" values="0.08;0.16;0.08" dur="5s" repeatCount="indefinite" />
    </polygon>
    <circle cx="350" cy="260" r="10" fill="#ff9800" opacity="0.1">
      <animate attributeName="cy" values="260;250;260" dur="4s" repeatCount="indefinite" />
    </circle>
    <defs>
      <linearGradient id="loginShieldGrad" x1="90" y1="50" x2="310" y2="310">
        <stop stopColor="#4573df" />
        <stop offset="1" stopColor="#6b93e8" />
      </linearGradient>
    </defs>
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Explore Page — Compass/map with route paths                        */
/* ------------------------------------------------------------------ */
export const ExploreIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 520 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Compass circle */}
    <circle cx="260" cy="190" r="100" fill="none" stroke="url(#exploreCompassGrad)" strokeWidth="3" opacity="0.15" />
    <circle cx="260" cy="190" r="85" fill="url(#exploreInnerGrad)" opacity="0.06" />
    {/* Compass needle */}
    <polygon points="260,110 268,190 260,200 252,190" fill="#e81123" opacity="0.2">
      <animateTransform attributeName="transform" type="rotate" from="0 260 190" to="360 260 190" dur="30s" repeatCount="indefinite" />
    </polygon>
    <polygon points="260,270 252,190 260,180 268,190" fill="#4573df" opacity="0.15">
      <animateTransform attributeName="transform" type="rotate" from="0 260 190" to="360 260 190" dur="30s" repeatCount="indefinite" />
    </polygon>
    <circle cx="260" cy="190" r="8" fill="#4573df" opacity="0.2" />
    {/* Route dots */}
    <circle cx="120" cy="120" r="10" fill="#ff9800" opacity="0.2">
      <animate attributeName="r" values="10;12;10" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="400" cy="130" r="10" fill="#27AE60" opacity="0.2">
      <animate attributeName="r" values="10;12;10" dur="3.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="140" cy="290" r="8" fill="#6b93e8" opacity="0.2">
      <animate attributeName="r" values="8;10;8" dur="4s" repeatCount="indefinite" />
    </circle>
    <circle cx="400" cy="280" r="9" fill="#e81123" opacity="0.15">
      <animate attributeName="r" values="9;11;9" dur="3.2s" repeatCount="indefinite" />
    </circle>
    {/* Route paths (dashed) */}
    <path d="M120 120 Q180 100 200 140" stroke="#ff9800" strokeWidth="1.5" fill="none" opacity="0.12" strokeDasharray="5 5">
      <animate attributeName="strokeDashoffset" from="0" to="-20" dur="2s" repeatCount="indefinite" />
    </path>
    <path d="M320 140 Q380 100 400 130" stroke="#27AE60" strokeWidth="1.5" fill="none" opacity="0.12" strokeDasharray="5 5">
      <animate attributeName="strokeDashoffset" from="0" to="-20" dur="2.5s" repeatCount="indefinite" />
    </path>
    <path d="M200 240 Q160 290 140 290" stroke="#6b93e8" strokeWidth="1.5" fill="none" opacity="0.12" strokeDasharray="5 5">
      <animate attributeName="strokeDashoffset" from="0" to="-20" dur="3s" repeatCount="indefinite" />
    </path>
    <path d="M320 240 Q370 280 400 280" stroke="#e81123" strokeWidth="1.5" fill="none" opacity="0.1" strokeDasharray="5 5">
      <animate attributeName="strokeDashoffset" from="0" to="-20" dur="2.8s" repeatCount="indefinite" />
    </path>
    {/* Floating shapes */}
    <rect x="60" cy="200" width="22" height="22" rx="5" fill="#4573df" opacity="0.08" y="200" transform="rotate(10 71 211)">
      <animateTransform attributeName="transform" type="rotate" from="10 71 211" to="370 71 211" dur="22s" repeatCount="indefinite" />
    </rect>
    <polygon points="460,200 472,182 484,200" fill="#ff9800" opacity="0.08">
      <animate attributeName="opacity" values="0.08;0.16;0.08" dur="5s" repeatCount="indefinite" />
    </polygon>
    <defs>
      <linearGradient id="exploreCompassGrad" x1="160" y1="90" x2="360" y2="290">
        <stop stopColor="#4573df" />
        <stop offset="1" stopColor="#ff9800" />
      </linearGradient>
      <radialGradient id="exploreInnerGrad" cx="50%" cy="45%">
        <stop stopColor="#4573df" />
        <stop offset="1" stopColor="#6b93e8" stopOpacity="0.2" />
      </radialGradient>
    </defs>
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Wallet Page — Wallet with coins & transaction flow                 */
/* ------------------------------------------------------------------ */
export const WalletIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 520 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Wallet body */}
    <rect x="140" y="120" width="240" height="170" rx="16" fill="url(#walletBodyGrad)" opacity="0.12" />
    {/* Wallet clasp */}
    <rect x="320" y="175" width="80" height="60" rx="12" fill="#4573df" opacity="0.1" />
    <circle cx="360" cy="205" r="14" fill="#ff9800" opacity="0.2" />
    <text x="360" y="210" textAnchor="middle" fill="#ff9800" fontSize="14" fontWeight="700" opacity="0.45">$</text>
    {/* Card inside wallet */}
    <rect x="165" y="145" width="140" height="85" rx="8" fill="url(#walletCardGrad)" opacity="0.12" />
    <rect x="180" y="160" width="50" height="6" rx="3" fill="#4573df" opacity="0.3" />
    <rect x="180" y="174" width="80" height="4" rx="2" fill="currentColor" opacity="0.08" />
    <rect x="180" y="200" width="30" height="15" rx="3" fill="#ff9800" opacity="0.15" />
    <rect x="220" y="200" width="30" height="15" rx="3" fill="#27AE60" opacity="0.12" />
    {/* Coins floating up */}
    <circle cx="200" cy="100" r="14" fill="#ff9800" opacity="0.18">
      <animate attributeName="cy" values="100;85;100" dur="3s" repeatCount="indefinite" />
    </circle>
    <text x="200" y="105" textAnchor="middle" fill="#ff9800" fontSize="12" fontWeight="700" opacity="0.35">
      <animate attributeName="y" values="105;90;105" dur="3s" repeatCount="indefinite" />
      $
    </text>
    <circle cx="290" cy="90" r="12" fill="#27AE60" opacity="0.15">
      <animate attributeName="cy" values="90;78;90" dur="3.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="350" cy="95" r="10" fill="#4573df" opacity="0.12">
      <animate attributeName="cy" values="95;85;95" dur="4s" repeatCount="indefinite" />
    </circle>
    {/* Transaction arrows */}
    <path d="M160 320 L200 320" stroke="#27AE60" strokeWidth="2" opacity="0.2" markerEnd="url(#arrowGreen)">
      <animate attributeName="opacity" values="0.2;0.35;0.2" dur="2.5s" repeatCount="indefinite" />
    </path>
    <rect x="210" y="312" width="80" height="16" rx="4" fill="#27AE60" opacity="0.08" />
    <rect x="220" y="317" width="40" height="5" rx="2.5" fill="#27AE60" opacity="0.15" />
    <path d="M340 320 L380 320" stroke="#e81123" strokeWidth="2" opacity="0.15" markerEnd="url(#arrowRed)">
      <animate attributeName="opacity" values="0.15;0.3;0.15" dur="3s" repeatCount="indefinite" />
    </path>
    <rect x="390" y="312" width="70" height="16" rx="4" fill="#e81123" opacity="0.06" />
    <rect x="398" y="317" width="35" height="5" rx="2.5" fill="#e81123" opacity="0.12" />
    {/* Floating shapes */}
    <circle cx="80" cy="150" r="18" fill="#6b93e8" opacity="0.08">
      <animate attributeName="cy" values="150;138;150" dur="3.5s" repeatCount="indefinite" />
    </circle>
    <rect x="440" y="110" width="22" height="22" rx="5" fill="#27AE60" opacity="0.08" transform="rotate(15 451 121)">
      <animateTransform attributeName="transform" type="rotate" from="15 451 121" to="375 451 121" dur="22s" repeatCount="indefinite" />
    </rect>
    <polygon points="75,310 87,292 99,310" fill="#e81123" opacity="0.08">
      <animate attributeName="opacity" values="0.08;0.16;0.08" dur="5s" repeatCount="indefinite" />
    </polygon>
    <defs>
      <linearGradient id="walletBodyGrad" x1="140" y1="120" x2="380" y2="290">
        <stop stopColor="#4573df" />
        <stop offset="1" stopColor="#6b93e8" />
      </linearGradient>
      <linearGradient id="walletCardGrad" x1="165" y1="145" x2="305" y2="230">
        <stop stopColor="#4573df" />
        <stop offset="1" stopColor="#ff9800" />
      </linearGradient>
      <marker id="arrowGreen" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
        <path d="M0,0 L6,2 L0,4" fill="#27AE60" opacity="0.4" />
      </marker>
      <marker id="arrowRed" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
        <path d="M0,0 L6,2 L0,4" fill="#e81123" opacity="0.3" />
      </marker>
    </defs>
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Projects Empty State — Briefcase with search magnifier             */
/* ------------------------------------------------------------------ */
export const ProjectsIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Briefcase */}
    <rect x="70" y="80" width="140" height="100" rx="12" fill="url(#projBriefGrad)" opacity="0.12" />
    <rect x="110" y="65" width="60" height="25" rx="6" fill="none" stroke="#4573df" strokeWidth="2" opacity="0.15" />
    <rect x="85" y="115" width="110" height="6" rx="3" fill="#4573df" opacity="0.2" />
    <rect x="85" y="128" width="90" height="4" rx="2" fill="currentColor" opacity="0.08" />
    <rect x="85" y="138" width="100" height="4" rx="2" fill="currentColor" opacity="0.06" />
    {/* Magnifying glass */}
    <circle cx="210" cy="70" r="22" fill="none" stroke="#ff9800" strokeWidth="2.5" opacity="0.2">
      <animate attributeName="r" values="22;24;22" dur="3s" repeatCount="indefinite" />
    </circle>
    <line x1="226" y1="86" x2="245" y2="105" stroke="#ff9800" strokeWidth="3" strokeLinecap="round" opacity="0.2" />
    {/* Floating elements */}
    <circle cx="40" cy="70" r="12" fill="#27AE60" opacity="0.1">
      <animate attributeName="cy" values="70;60;70" dur="3.5s" repeatCount="indefinite" />
    </circle>
    <rect x="240" y="150" width="18" height="18" rx="4" fill="#6b93e8" opacity="0.08" transform="rotate(15 249 159)">
      <animateTransform attributeName="transform" type="rotate" from="15 249 159" to="375 249 159" dur="20s" repeatCount="indefinite" />
    </rect>
    <polygon points="35,170 44,155 53,170" fill="#e81123" opacity="0.08">
      <animate attributeName="opacity" values="0.08;0.16;0.08" dur="5s" repeatCount="indefinite" />
    </polygon>
    <defs>
      <linearGradient id="projBriefGrad" x1="70" y1="80" x2="210" y2="180">
        <stop stopColor="#4573df" />
        <stop offset="1" stopColor="#6b93e8" />
      </linearGradient>
    </defs>
  </svg>
);
