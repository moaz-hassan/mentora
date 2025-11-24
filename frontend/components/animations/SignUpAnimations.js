const RegisterAnimation = () => (
  <svg
    className="w-full h-full"
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#a855f7", stopOpacity: 1 }}>
          <animate
            attributeName="stop-color"
            values="#a855f7;#ec4899;#a855f7"
            dur="3s"
            repeatCount="indefinite"
          />
        </stop>
        <stop offset="100%" style={{ stopColor: "#ec4899", stopOpacity: 1 }}>
          <animate
            attributeName="stop-color"
            values="#ec4899;#a855f7;#ec4899"
            dur="3s"
            repeatCount="indefinite"
          />
        </stop>
      </linearGradient>
      <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#a855f7", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#ec4899", stopOpacity: 1 }} />
      </linearGradient>
    </defs>

    {/* Central certificate/diploma */}
    <g>
      <rect
        x="120"
        y="150"
        width="160"
        height="120"
        rx="8"
        fill="white"
        stroke="#a855f7"
        strokeWidth="3"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 200 210; 2 200 210; 0 200 210; -2 200 210; 0 200 210"
          dur="4s"
          repeatCount="indefinite"
        />
      </rect>

      {/* Certificate ribbon */}
      <circle cx="200" cy="150" r="20" fill="url(#grad2)">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 200 210; 2 200 210; 0 200 210; -2 200 210; 0 200 210"
          dur="4s"
          repeatCount="indefinite"
        />
      </circle>
      <path
        d="M 190 155 L 185 175 L 200 165 L 215 175 L 210 155"
        fill="url(#grad2)"
        opacity="0.8"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 200 210; 2 200 210; 0 200 210; -2 200 210; 0 200 210"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>

      {/* Certificate text lines */}
      <rect x="140" y="180" width="120" height="4" rx="2" fill="#e9d5ff">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 200 210; 2 200 210; 0 200 210; -2 200 210; 0 200 210"
          dur="4s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="150" y="195" width="100" height="4" rx="2" fill="#e9d5ff">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 200 210; 2 200 210; 0 200 210; -2 200 210; 0 200 210"
          dur="4s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="160" y="210" width="80" height="4" rx="2" fill="#e9d5ff">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 200 210; 2 200 210; 0 200 210; -2 200 210; 0 200 210"
          dur="4s"
          repeatCount="indefinite"
        />
      </rect>

      {/* Signature line */}
      <path
        d="M 150 240 Q 170 235 180 240 Q 190 245 200 240 Q 210 235 220 240 Q 230 245 250 240"
        stroke="#a855f7"
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 200 210; 2 200 210; 0 200 210; -2 200 210; 0 200 210"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>
    </g>

    {/* Floating books stack */}
    <g>
      <rect
        x="50"
        y="240"
        width="70"
        height="10"
        rx="2"
        fill="#ec4899"
        opacity="0.8"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 0,-8; 0,0"
          dur="3s"
          repeatCount="indefinite"
        />
      </rect>
      <rect
        x="55"
        y="225"
        width="65"
        height="10"
        rx="2"
        fill="#a855f7"
        opacity="0.8"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 0,-8; 0,0"
          dur="3s"
          begin="0.2s"
          repeatCount="indefinite"
        />
      </rect>
      <rect
        x="60"
        y="210"
        width="60"
        height="10"
        rx="2"
        fill="#d946ef"
        opacity="0.8"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 0,-8; 0,0"
          dur="3s"
          begin="0.4s"
          repeatCount="indefinite"
        />
      </rect>
    </g>

    {/* Graduation cap */}
    <g>
      <path d="M 320 240 L 350 250 L 320 260 L 290 250 Z" fill="#a855f7">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; -5,10; 0,0"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </path>
      <rect x="318" y="260" width="4" height="30" fill="#ec4899">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; -5,10; 0,0"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </rect>
      <circle cx="320" cy="292" r="8" fill="#fbbf24">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; -5,10; 0,0"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </circle>
    </g>

    {/* Sparkles */}
    {[...Array(8)].map((_, i) => (
      <g key={i}>
        <path
          d={`M ${100 + i * 40} ${80 + (i % 3) * 80} l 3 3 l -3 3 l -3 -3 Z`}
          fill="#fbbf24"
          opacity="0.6"
        >
          <animate
            attributeName="opacity"
            values="0.2;1;0.2"
            dur={1.5 + i * 0.3 + "s"}
            repeatCount="indefinite"
          />
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0; 180; 360"
            dur={3 + i * 0.2 + "s"}
            repeatCount="indefinite"
          />
        </path>
      </g>
    ))}

    {/* Profile badge with checkmark */}
    <g opacity="0.8">
      <circle cx="320" cy="120" r="30" fill="url(#grad2)">
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1;1.08;1"
          dur="2s"
          repeatCount="indefinite"
          additive="sum"
        />
      </circle>
      <circle cx="320" cy="115" r="12" fill="white" opacity="0.9" />
      <path
        d="M 320 125 Q 310 135 310 145 L 310 150 L 330 150 L 330 145 Q 330 135 320 125 Z"
        fill="white"
        opacity="0.9"
      />
      <path
        d="M 313 135 L 318 140 L 327 128"
        stroke="#a855f7"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      >
        <animate
          attributeName="stroke-dasharray"
          values="0 20; 20 20"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>
    </g>
  </svg>
);

export default RegisterAnimation;
