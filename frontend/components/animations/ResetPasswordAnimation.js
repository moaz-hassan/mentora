
export default function ResetPasswordAnimation() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="w-full h-full max-w-lg mx-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      {}
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#14b8a6", stopOpacity: 0.1 }} />
          <stop offset="100%" style={{ stopColor: "#06b6d4", stopOpacity: 0.1 }} />
        </linearGradient>
        
        <linearGradient id="keyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#14b8a6", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#06b6d4", stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {}
      <circle cx="200" cy="200" r="150" fill="url(#bgGradient)">
        <animate
          attributeName="r"
          values="150;160;150"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>

      {}
      <circle cx="200" cy="80" r="6" fill="#14b8a6" opacity="0.6">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 200 200"
          to="360 200 200"
          dur="8s"
          repeatCount="indefinite"
        />
      </circle>
      
      <circle cx="200" cy="80" r="6" fill="#06b6d4" opacity="0.6">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="180 200 200"
          to="540 200 200"
          dur="8s"
          repeatCount="indefinite"
        />
      </circle>

      {}
      <g transform="translate(200, 200)">
        <rect
          x="-30"
          y="40"
          width="20"
          height="60"
          rx="3"
          fill="url(#keyGradient)"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 -20 70;-10 -20 70;0 -20 70"
            dur="2s"
            repeatCount="indefinite"
          />
        </rect>

        {}
        <rect x="-30" y="95" width="6" height="10" fill="url(#keyGradient)">
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 -20 70;-10 -20 70;0 -20 70"
            dur="2s"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="-20" y="95" width="6" height="15" fill="url(#keyGradient)">
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 -20 70;-10 -20 70;0 -20 70"
            dur="2s"
            repeatCount="indefinite"
          />
        </rect>

        {}
        <circle cx="-20" cy="30" r="25" fill="url(#keyGradient)">
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 -20 30;-10 -20 30;0 -20 30"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        
        {}
        <circle cx="-20" cy="30" r="8" fill="white">
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 -20 30;-10 -20 30;0 -20 30"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>

        {}
        <rect
          x="10"
          y="50"
          width="60"
          height="70"
          rx="8"
          fill="#0d9488"
          opacity="0.9"
        />

        {}
        <path
          d="M 25 50 Q 25 20, 40 20 Q 55 20, 55 50"
          stroke="#0d9488"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          opacity="0.9"
        />

        {}
        <circle cx="40" cy="75" r="6" fill="#06b6d4" />
        <rect x="37" y="75" width="6" height="15" rx="2" fill="#06b6d4" />

        {}
        <g opacity="0.8">
          <path d="M 75 60 L 77 65 L 82 67 L 77 69 L 75 74 L 73 69 L 68 67 L 73 65 Z" fill="#fbbf24">
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </path>
          <path d="M 5 85 L 7 89 L 11 91 L 7 93 L 5 97 L 3 93 L -1 91 L 3 89 Z" fill="#fbbf24">
            <animate
              attributeName="opacity"
              values="1;0.3;1"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </g>

      {}
      <circle cx="80" cy="100" r="3" fill="#14b8a6" opacity="0.4">
        <animate attributeName="cy" values="100;90;100" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="320" cy="150" r="4" fill="#06b6d4" opacity="0.4">
        <animate attributeName="cy" values="150;140;150" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="300" r="3" fill="#14b8a6" opacity="0.4">
        <animate attributeName="cy" values="300;290;300" dur="3.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="300" cy="280" r="4" fill="#06b6d4" opacity="0.4">
        <animate attributeName="cy" values="280;270;280" dur="4.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
