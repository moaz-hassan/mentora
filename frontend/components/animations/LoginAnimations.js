const LoginAnimation = () => (
  <svg
    className="w-full h-full"
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#6366f1", stopOpacity: 1 }}>
          <animate
            attributeName="stop-color"
            values="#6366f1;#8b5cf6;#6366f1"
            dur="3s"
            repeatCount="indefinite"
          />
        </stop>
        <stop offset="100%" style={{ stopColor: "#8b5cf6", stopOpacity: 1 }}>
          <animate
            attributeName="stop-color"
            values="#8b5cf6;#6366f1;#8b5cf6"
            dur="3s"
            repeatCount="indefinite"
          />
        </stop>
      </linearGradient>
    </defs>
    <g>
      <rect
        x="80"
        y="120"
        width="60"
        height="80"
        rx="4"
        fill="url(#grad1)"
        opacity="0.9"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 0,-10; 0,0"
          dur="2s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="85" y="125" width="50" height="3" fill="white" opacity="0.3" />
      <rect x="85" y="135" width="40" height="2" fill="white" opacity="0.3" />
      <rect x="85" y="145" width="45" height="2" fill="white" opacity="0.3" />
    </g>
    <g>
      <rect
        x="150"
        y="200"
        width="120"
        height="80"
        rx="4"
        fill="#4f46e5"
        opacity="0.8"
      />
      <rect x="155" y="205" width="110" height="65" fill="#6366f1" />
      <path d="M 140 280 L 280 280 L 270 290 L 150 290 Z" fill="#312e81" /> 
      <rect x="165" y="215" width="30" height="3" fill="#34d399" opacity="0.7">
        <animate
          attributeName="width"
          values="30;50;30"
          dur="2s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="165" y="225" width="40" height="3" fill="#60a5fa" opacity="0.7">
        <animate
          attributeName="width"
          values="40;60;40"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="165" y="235" width="35" height="3" fill="#f472b6" opacity="0.7">
        <animate
          attributeName="width"
          values="35;55;35"
          dur="3s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="165" y="245" width="2" height="8" fill="#34d399">
        <animate
          attributeName="opacity"
          values="1;0;1"
          dur="1s"
          repeatCount="indefinite"
        />
      </rect>
    </g>
    <circle cx="300" cy="100" r="8" fill="#8b5cf6" opacity="0.6">
      <animateTransform
        attributeName="transform"
        type="translate"
        values="0,0; 10,-15; 0,0"
        dur="4s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="100" cy="280" r="6" fill="#6366f1" opacity="0.6">
      <animateTransform
        attributeName="transform"
        type="translate"
        values="0,0; -8,12; 0,0"
        dur="3.5s"
        repeatCount="indefinite"
      />
    </circle>
    <g opacity="0.7">
      <circle
        cx="320"
        cy="240"
        r="15"
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="3"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 320 240; 15 320 240; 0 320 240"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <rect x="335" y="238" width="20" height="4" fill="#8b5cf6">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 320 240; 15 320 240; 0 320 240"
          dur="2s"
          repeatCount="indefinite"
        />
      </rect>
    </g>
  </svg>
);

export default LoginAnimation;
