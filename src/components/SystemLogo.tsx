import React from "react";

interface SystemLogoProps {
  className?: string;
  size?: number | string;
}

export const SystemLogo: React.FC<SystemLogoProps> = ({ className = "", size = "100%" }) => {
  return (
    <svg
      id="system_logo_svg"
      viewBox="0 0 400 400"
      width={size}
      height={size}
      className={`select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer dark blue/black circle */}
      <circle cx="200" cy="200" r="192" fill="#040b14" />
      
      {/* Thick white circular border */}
      <circle cx="200" cy="200" r="185" fill="none" stroke="#ffffff" strokeWidth="10" />
      
      {/* Dynamic dashed styling ring */}
      <circle cx="200" cy="200" r="176" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="6 6" opacity="0.4" />

      {/* Confetti Elements */}
      {/* Red */}
      <polygon points="50,150 58,145 54,155" fill="#f87171" transform="rotate(25 50 150)" />
      <polygon points="340,140 348,135 344,145" fill="#f87171" transform="rotate(-15 340 140)" />
      <polygon points="280,70 286,65 282,73" fill="#f87171" transform="rotate(45 280 70)" />
      {/* Yellow */}
      <polygon points="110,65 118,60 114,70" fill="#facc15" transform="rotate(10 110 65)" />
      <polygon points="310,240 318,235 314,245" fill="#facc15" transform="rotate(35 310 240)" />
      {/* Blue */}
      <polygon points="120,130 126,124 122,132" fill="#60a5fa" transform="rotate(-30 120 130)" />
      <polygon points="260,110 268,105 264,115" fill="#60a5fa" transform="rotate(15 260 110)" />
      {/* Green */}
      <polygon points="70,100 78,92 73,103" fill="#34d399" transform="rotate(40 70 100)" />
      
      {/* Header Text Group (FIFA 2026) */}
      <g id="logo-header">
        {/* FIFA text in bold sport-grotesk white */}
        <text
          x="195"
          y="105"
          fill="#ffffff"
          fontSize="66"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          letterSpacing="2"
        >
          FIFA
        </text>
        
        {/* 2026 text in vibrant football-turf green */}
        <text
          x="195"
          y="162"
          fill="#22c55e"
          fontSize="60"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          letterSpacing="1"
        >
          2026
        </text>

        {/* Golden Trophy (🏆) illustration */}
        <g id="trophy-vector" transform="translate(300, 75) scale(0.95)">
          {/* Base */}
          <path d="M 12 55 L 38 55 L 34 60 L 16 60 Z" fill="#d97706" />
          <path d="M 16 48 L 34 48 L 36 55 L 14 55 Z" fill="#b45309" />
          <rect x="22" y="30" width="6" height="18" fill="#f59e0b" rx="1" />
          <path d="M 22 35 C 16 33, 16 28, 16 24 C 20 24, 21 30, 22 35 Z" fill="#d97706" />
          <path d="M 28 35 C 34 33, 34 28, 34 24 C 30 24, 29 30, 28 35 Z" fill="#d97706" />
          {/* Main Cup Globe */}
          <circle cx="25" cy="20" r="14" fill="#fbbf24" />
          {/* Detail band stripes */}
          <path d="M 13 22 Q 25 31 37 22" fill="none" stroke="#22c55e" strokeWidth="2.5" />
          <path d="M 15 15 Q 25 24 35 15" fill="none" stroke="#22c55e" strokeWidth="2.5" />
          {/* Highlights */}
          <circle cx="20" cy="15" r="3" fill="#fff" opacity="0.3" />
        </g>
      </g>

      {/* Cheering Friends Group */}
      <g id="cheering-friends" transform="translate(0, 5)">
        {/* Grey Cozy Sofa Background */}
        <path d="M 50 310 C 50 295, 350 295, 350 310 L 350 350 L 50 350 Z" fill="#2d3748" opacity="0.85" />
        
        {/* --- Friend 1: Yellow Brazil Jersey (Left side) --- */}
        <g id="friend-brazil">
          {/* Body */}
          <path d="M 68 340 C 68 285, 128 285, 128 340 Z" fill="#eab308" />
          {/* Collar detail */}
          <path d="M 88 290 Q 98 298 108 290" fill="none" stroke="#16a34a" strokeWidth="3.5" />
          {/* Raised Arm */}
          <path d="M 72 320 Q 52 260 48 220" fill="none" stroke="#fdba74" strokeWidth="15" strokeLinecap="round" />
          {/* Hand fist */}
          <circle cx="48" cy="214" r="9" fill="#fdba74" />
          {/* Head & Neck */}
          <rect x="92" y="258" width="12" height="15" fill="#fdba74" />
          <circle cx="98" cy="245" r="21" fill="#fdba74" />
          {/* Black hair & Full beard */}
          <path d="M 77 245 C 77 220, 119 220, 119 245 C 119 238, 77 238, 77 245" fill="#18181b" />
          <path d="M 77 245 C 77 270, 119 270, 119 245 L 111 264 Q 98 272 85 264 Z" fill="#18181b" opacity="0.9" />
          {/* Face details (Cheering eyes & wide open mouth smile) */}
          <path d="M 88 244 Q 92 240 94 244" fill="none" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
          <path d="M 102 244 Q 104 240 108 244" fill="none" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
          <path d="M 91 251 Q 98 261 105 251 Z" fill="#ffffff" stroke="#e11d48" strokeWidth="1" />
        </g>

        {/* --- Friend 2: Blue France Jersey (Middle-Left) --- */}
        <g id="friend-france">
          {/* Body */}
          <path d="M 128 340 C 128 282, 192 282, 192 340 Z" fill="#1d4ed8" />
          <path d="M 152 290 Q 160 297 168 290" fill="none" stroke="#ffffff" strokeWidth="3" />
          {/* Arm holding soccer ball */}
          <path d="M 132 325 Q 146 322 154 315" fill="none" stroke="#fed7aa" strokeWidth="13" strokeLinecap="round" />
          {/* Head & Curly hair */}
          <rect x="154" y="258" width="12" height="15" fill="#fed7aa" />
          <circle cx="160" cy="244" r="21" fill="#fed7aa" />
          {/* Curly Brown Hair (Multi-circles overlay) */}
          <circle cx="140" cy="235" r="11" fill="#78350f" />
          <circle cx="154" cy="225" r="12" fill="#78350f" />
          <circle cx="168" cy="224" r="12" fill="#78350f" />
          <circle cx="178" cy="235" r="12" fill="#78350f" />
          <circle cx="140" cy="250" r="10" fill="#78350f" />
          <circle cx="180" cy="250" r="10" fill="#78350f" />
          {/* Eyes & Smiling mouth */}
          <circle cx="152" cy="245" r="2" fill="#18181b" />
          <circle cx="168" cy="245" r="2" fill="#18181b" />
          <path d="M 151 251 Q 160 262 169 251 Z" fill="#ffffff" stroke="#e11d48" strokeWidth="1" />
          {/* Classic Soccer Ball held in front */}
          <g id="held-ball" transform="translate(132, 312)">
            <circle cx="15" cy="15" r="15" fill="#ffffff" stroke="#18181b" strokeWidth="2" />
            <polygon points="15,9 19,13 17,18 13,18 11,13" fill="#18181b" />
            <line x1="15" y1="9" x2="15" y2="0" stroke="#18181b" strokeWidth="1.5" />
            <line x1="19" y1="13" x2="28" y2="10" stroke="#18181b" strokeWidth="1.5" />
            <line x1="17" y1="18" x2="24" y2="26" stroke="#18181b" strokeWidth="1.5" />
            <line x1="13" y1="18" x2="6" y2="26" stroke="#18181b" strokeWidth="1.5" />
            <line x1="11" y1="13" x2="2" y2="10" stroke="#18181b" strokeWidth="1.5" />
          </g>
        </g>

        {/* --- Friend 3: Argentina Light-blue/white stripes #10 (Middle-Right) --- */}
        <g id="friend-argentina">
          {/* Body with blue/white striped jersey */}
          <path d="M 192 340 C 192 280, 260 280, 260 340 Z" fill="#bae6fd" />
          {/* White vertical stripes */}
          <rect x="207" y="286" width="9" height="54" fill="#ffffff" />
          <rect x="226" y="281" width="9" height="59" fill="#ffffff" />
          <rect x="244" y="286" width="9" height="54" fill="#ffffff" />
          {/* Argentina golden chest emblem print */}
          <circle cx="216" cy="301" r="2.5" fill="#eab308" />
          {/* Number 10 graphic on strip */}
          <text x="231" y="318" fill="#0284c7" fontSize="13" fontWeight="900" fontFamily="sans-serif">10</text>
          {/* Head & Neck */}
          <rect x="219" y="258" width="12" height="15" fill="#ffeedd" />
          {/* Long dark brown hair in back */}
          <path d="M 200 248 C 200 210, 250 210, 250 248 L 253 290 L 197 290 Z" fill="#451a03" />
          <circle cx="225" cy="244" r="21" fill="#ffeedd" />
          {/* Hair overlay front bang */}
          <path d="M 204 235 Q 225 220 246 235" fill="none" stroke="#451a03" strokeWidth="5" strokeLinecap="round" />
          {/* Face details (cheering eyes & smile) */}
          <circle cx="217" cy="245" r="2" fill="#18181b" />
          <circle cx="233" cy="245" r="2" fill="#18181b" />
          <path d="M 216 251 Q 225 261 234 251 Z" fill="#ffffff" stroke="#e11d48" strokeWidth="1" />
        </g>

        {/* --- Friend 4: Red Spain Jersey (Right side) --- */}
        <g id="friend-spain">
          {/* Body */}
          <path d="M 260 340 C 260 285, 320 285, 320 340 Z" fill="#dc2626" />
          {/* Yellow Collar */}
          <path d="M 280 290 Q 290 297 300 290" fill="none" stroke="#facc15" strokeWidth="3.5" />
          {/* Raised Arm with a soccer ball */}
          <path d="M 306 315 Q 328 260 338 220" fill="none" stroke="#fed7aa" strokeWidth="15" strokeLinecap="round" />
          {/* Soccer ball held high */}
          <g id="held-ball-2" transform="translate(325, 192)">
            <circle cx="13" cy="13" r="13" fill="#ffffff" stroke="#18181b" strokeWidth="1.8" />
            <polygon points="13,8 16,11 15,15 11,15 10,11" fill="#18181b" />
            <line x1="13" y1="8" x2="13" y2="0" stroke="#18181b" strokeWidth="1.2" />
            <line x1="16" y1="11" x2="24" y2="9" stroke="#18181b" strokeWidth="1.2" />
            <line x1="15" y1="15" x2="21" y2="22" stroke="#18181b" strokeWidth="1.2" />
            <line x1="11" y1="15" x2="5" y2="22" stroke="#18181b" strokeWidth="1.2" />
            <line x1="10" y1="11" x2="2" y2="9" stroke="#18181b" strokeWidth="1.2" />
          </g>
          {/* Head & Neck */}
          <rect x="284" y="258" width="12" height="15" fill="#fed7aa" />
          <circle cx="290" cy="245" r="21" fill="#fed7aa" />
          {/* Black hair & short stubble beard */}
          <path d="M 269 245 C 269 220, 311 220, 311 245 C 311 238, 269 238, 269 245" fill="#18181b" />
          <path d="M 271 258 Q 290 268 309 258" fill="none" stroke="#71717a" strokeWidth="3" opacity="0.4" />
          {/* Cheering eyes & open mouth */}
          <path d="M 280 244 Q 284 240 286 244" fill="none" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
          <path d="M 294 244 Q 296 240 300 244" fill="none" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
          <path d="M 283 251 Q 290 261 297 251 Z" fill="#ffffff" stroke="#e11d48" strokeWidth="1" />
        </g>
      </g>

      {/* Foreground Interactive TV Screen */}
      <g id="tv-foreground" transform="translate(0, 5)">
        {/* Dark TV Bezel Frame */}
        <rect x="110" y="328" width="180" height="54" fill="#0f172a" rx="5" stroke="#334155" strokeWidth="3" />
        <rect x="116" y="333" width="168" height="44" fill="#1e293b" rx="2" />
        
        {/* Glowing match pitch display screen graphic */}
        <path d="M 116 333 L 135 377 L 116 377 Z" fill="#15803d" opacity="0.6" />
        <path d="M 284 333 L 265 377 L 284 377 Z" fill="#166534" opacity="0.6" />
        {/* Center line representation */}
        <ellipse cx="200" cy="355" rx="14" ry="10" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
        <line x1="200" y1="333" x2="200" y2="377" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
      </g>

      {/* Popcorn Bowl Sitting on the Floor/Table below */}
      <g id="popcorn-bowl" transform="translate(0, 6)">
        {/* Green bowl */}
        <path d="M 165 374 Q 200 405, 235 374 Z" fill="#16a34a" stroke="#14532d" strokeWidth="1.5" />
        {/* Yellow fluffy popcorn overflow dots */}
        <circle cx="172" cy="371" r="7" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
        <circle cx="184" cy="368" r="8" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
        <circle cx="196" cy="365" r="9" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
        <circle cx="206" cy="367" r="8" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
        <circle cx="218" cy="369" r="8" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
        <circle cx="227" cy="372" r="7" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
        {/* Second layer top pop pieces */}
        <circle cx="180" cy="364" r="6" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
        <circle cx="191" cy="360" r="7" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
        <circle cx="201" cy="361" r="8" fill="#ffffff" stroke="#ca8a04" strokeWidth="0.5" />
        <circle cx="212" cy="363" r="6" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
      </g>

      {/* Red Party Solo Cups */}
      <g id="party-cups" transform="translate(0, 5)">
        {/* Left red cup */}
        <polygon points="85,355 93,355 91,372 87,372" fill="#ef4444" stroke="#b91c1c" strokeWidth="0.5" />
        <ellipse cx="89" cy="355" rx="4" ry="1.5" fill="#ffffff" stroke="#b91c1c" strokeWidth="0.5" />
        
        {/* Right blue cup */}
        <polygon points="305,355 313,355 311,372 307,372" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="0.5" />
        <ellipse cx="309" cy="355" rx="4" ry="1.5" fill="#ffffff" stroke="#1d4ed8" strokeWidth="0.5" />
      </g>
    </svg>
  );
};
