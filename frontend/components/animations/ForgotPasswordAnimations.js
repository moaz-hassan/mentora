const ForgotPasswordAnimation = () => (
  <svg
    className="w-full h-full"
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
       {" "}
    <defs>
           {" "}
      <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
               {" "}
        <stop offset="0%" style={{ stopColor: "#14b8a6", stopOpacity: 1 }}>
                   {" "}
          <animate
            attributeName="stop-color"
            values="#14b8a6;#06b6d4;#14b8a6"
            dur="3s"
            repeatCount="indefinite"
          />
                 {" "}
        </stop>
               {" "}
        <stop offset="100%" style={{ stopColor: "#06b6d4", stopOpacity: 1 }}>
                   {" "}
          <animate
            attributeName="stop-color"
            values="#06b6d4;#14b8a6;#06b6d4"
            dur="3s"
            repeatCount="indefinite"
          />
                 {" "}
        </stop>
             {" "}
      </linearGradient>
         {" "}
    </defs>
       {" "}
    <g>
           {" "}
      <rect
        x="120"
        y="180"
        width="160"
        height="120"
        rx="8"
        fill="url(#grad3)"
        opacity="0.9"
      />
           {" "}
      <path d="M 120 180 L 200 240 L 280 180" fill="#0891b2" opacity="0.5">
               {" "}
        <animate
          attributeName="d"
          values="M 120 180 L 200 240 L 280 180;M 120 180 L 200 230 L 280 180;M 120 180 L 200 240 L 280 180"
          dur="2s"
          repeatCount="indefinite"
        />
             {" "}
      </path>
           {" "}
      <path
        d="M 120 180 L 200 240 L 280 180"
        stroke="white"
        strokeWidth="2"
        fill="none"
        opacity="0.7"
      >
               {" "}
        <animate
          attributeName="d"
          values="M 120 180 L 200 240 L 280 180;M 120 180 L 200 230 L 280 180;M 120 180 L 200 240 L 280 180"
          dur="2s"
          repeatCount="indefinite"
        />
             {" "}
      </path>
           {" "}
      <rect x="140" y="220" width="120" height="3" fill="white" opacity="0.6">
               {" "}
        <animate
          attributeName="y"
          values="240;220;240"
          dur="3s"
          repeatCount="indefinite"
        />
               {" "}
        <animate
          attributeName="opacity"
          values="0;0.6;0"
          dur="3s"
          repeatCount="indefinite"
        />
             {" "}
      </rect>
         {" "}
    </g>
       {" "}
    <g>
           {" "}
      <path
        d="M 320 120 L 340 130 L 330 135 L 335 145 Z"
        fill="#14b8a6"
        opacity="0.8"
      >
               {" "}
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; -200,100; -200,100"
          dur="3s"
          repeatCount="indefinite"
        />
               {" "}
        <animate
          attributeName="opacity"
          values="0.8;0.8;0"
          dur="3s"
          repeatCount="indefinite"
        />
             {" "}
      </path>
         {" "}
    </g>
       {" "}
    <g opacity="0.7">
           {" "}
      <rect x="70" cy="280" width="40" height="50" rx="4" fill="#0891b2">
               {" "}
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 90 280; -10 90 280; 0 90 280"
          dur="2s"
          repeatCount="indefinite"
        />
               {" "}
      </rect>
             {" "}
      <path
        d="M 75 280 L 75 260 Q 75 245 90 245 Q 105 245 105 260 L 105 280"
        stroke="#14b8a6"
        strokeWidth="6"
        fill="none"
      >
               {" "}
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 90 280; -10 90 280; 0 90 280"
          dur="2s"
          repeatCount="indefinite"
        />
               {" "}
      </path>
             {" "}
      <circle cx="90" cy="300" r="6" fill="#14b8a6">
               {" "}
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 90 280; -10 90 280; 0 90 280"
          dur="2s"
          repeatCount="indefinite"
        />
             {" "}
      </circle>
         {" "}
    </g>
       {" "}
    <g>
           {" "}
      <circle
        cx="300"
        cy="280"
        r="25"
        fill="none"
        stroke="#14b8a6"
        strokeWidth="3"
      >
               {" "}
        <animate
          attributeName="stroke-dasharray"
          values="0 157; 157 157"
          dur="2s"
          repeatCount="indefinite"
        />
             {" "}
      </circle>
           {" "}
      <path
        d="M 290 280 L 297 287 L 310 270"
        stroke="#14b8a6"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
               {" "}
        <animate
          attributeName="stroke-dasharray"
          values="0 30; 30 30"
          dur="2s"
          begin="0.5s"
          repeatCount="indefinite"
        />
             {" "}
      </path>
         {" "}
    </g>
       {" "}
    {[...Array(5)].map((_, i) => (
      <circle
        key={i}
        cx={100 + i * 60}
        cy={100 + (i % 2) * 40}
        r="4"
        fill="#06b6d4"
        opacity="0.5"
      >
               {" "}
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 0,-15; 0,0"
          dur={2 + i * 0.5 + "s"}
          repeatCount="indefinite"
        />
             {" "}
      </circle>
    ))}
     {" "}
  </svg>
);

export default ForgotPasswordAnimation;
