const HeroAnimation = () => (
  <svg
    className="w-full h-full max-w-md"
    viewBox="0 0 500 500"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="heroGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
      <linearGradient id="heroGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
      <filter id="heroShadow">
        <feDropShadow dx="0" dy="10" stdDeviation="15" floodOpacity="0.3" />
      </filter>
    </defs>

    {/* Background animated circles */}
    <circle cx="100" cy="100" r="80" fill="url(#heroGrad1)" opacity="0.15">
      <animate
        attributeName="r"
        values="80;100;80"
        dur="4s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="400" cy="400" r="100" fill="url(#heroGrad2)" opacity="0.15">
      <animate
        attributeName="r"
        values="100;120;100"
        dur="5s"
        repeatCount="indefinite"
      />
    </circle>

    {/* Main book/course card */}
    <g filter="url(#heroShadow)">
      <rect
        x="100"
        y="80"
        width="300"
        height="240"
        rx="20"
        fill="url(#heroGrad1)"
      />
      <rect x="110" y="90" width="280" height="220" rx="16" fill="white" />

      {/* Header section */}
      <rect
        x="120"
        y="105"
        width="260"
        height="40"
        rx="8"
        fill="url(#heroGrad1)"
      />
      <text
        x="250"
        y="135"
        fontSize="20"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
      >
        Learn Anything
      </text>

      {/* Content lines */}
      <rect x="120" y="160" width="260" height="6" rx="3" fill="#e5e7eb" />
      <rect x="120" y="175" width="240" height="6" rx="3" fill="#e5e7eb" />
      <rect x="120" y="190" width="250" height="6" rx="3" fill="#e5e7eb" />
      <rect x="120" y="205" width="220" height="6" rx="3" fill="#e5e7eb" />

      {/* Animated progress bar */}
      <rect x="120" y="230" width="260" height="8" rx="4" fill="#f3f4f6" />
      <rect
        x="120"
        y="230"
        width="100"
        height="8"
        rx="4"
        fill="url(#heroGrad2)"
      >
        <animate
          attributeName="width"
          values="100;200;100"
          dur="3s"
          repeatCount="indefinite"
        />
      </rect>
    </g>

    {/* Floating elements */}
    <g>
      <circle cx="80" cy="250" r="12" fill="#8b5cf6" opacity="0.8">
        <animateMotion
          dur="6s"
          repeatCount="indefinite"
          path="M 0 0 Q 30 -50 0 0"
        />
      </circle>
    </g>

    <g>
      <rect
        x="380"
        y="150"
        width="80"
        height="80"
        rx="12"
        fill="#ec4899"
        opacity="0.8"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 420 190; 360 420 190"
          dur="8s"
          repeatCount="indefinite"
        />
      </rect>
      <text
        x="420"
        y="200"
        fontSize="36"
        fill="white"
        textAnchor="middle"
        fontWeight="bold"
      >
        ✓
      </text>
    </g>

    {/* Decorative stars */}
    <g fill="#f97316" opacity="0.6">
      <circle cx="150" cy="50" r="4">
        <animate
          attributeName="opacity"
          values="0.3;1;0.3"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="350" cy="450" r="4">
        <animate
          attributeName="opacity"
          values="0.3;1;0.3"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="450" cy="300" r="3">
        <animate
          attributeName="opacity"
          values="0.3;1;0.3"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
    </g>
  </svg>
);

export default HeroAnimation;
