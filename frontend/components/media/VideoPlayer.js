"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function VideoPlayer({
  publicId,
  onNextLesson,
  onProgress,
  autoPlay = false,
  showNextButton = true,
}) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  
  const [isScriptLoaded, setIsScriptLoaded] = useState(
    () => typeof window !== "undefined" && !!window.cloudinary
  );
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  
  const cleanupPlayer = () => {
    if (playerRef.current) {
      try {
        playerRef.current.dispose();
      } catch (error) {
        console.error("Error disposing player:", error);
      }
      playerRef.current = null;
    }
    setIsPlayerReady(false);
  };

  
  const initPlayer = () => {
    if (!window.cloudinary || !videoRef.current) return;

    
    if (playerRef.current) {
      cleanupPlayer();
    }

    try {
      const cld = window.cloudinary.Cloudinary.new({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      });

      
      playerRef.current = cld.videoPlayer(videoRef.current, {
        logo: false,
        colors: {
          accent: "#3f7bff",
          base: "#000000",
          text: "#ffffff",
        },
        fluid: true,
        controls: true,
        fontFace: "Inter",
        hideContextMenu: true,
        showJumpControls: true,
        qualitySelector: true,
        autoplay: autoPlay,
        muted: autoPlay,
      });

      
      playerRef.current.source(publicId, {
        sourceTypes: ["hls"],
        transformation: { streaming_profile: "hd" },
        info: { title: "" },
      });

      setIsPlayerReady(true);

      
      if (onNextLesson && showNextButton) {
        playerRef.current.on("ended", onNextLesson);
      }

      
      if (onProgress) {
        playerRef.current.on("timeupdate", () => {
          const player = playerRef.current;
          if (player) {
            const currentTime = player.currentTime();
            const duration = player.duration();
            if (duration > 0) {
              const percentage = (currentTime / duration) * 100;
              onProgress(percentage);
            }
          }
        });
      }
    } catch (error) {
      console.error("Error initializing player:", error);
    }
  };

  
  useEffect(() => {
    if (window.cloudinary && !isScriptLoaded) {
      setIsScriptLoaded(true);
    }
  }, []);

  
  useEffect(() => {
    if (window.cloudinary) {
      
      const timer = setTimeout(() => {
        initPlayer();
      }, 100);

      return () => {
        clearTimeout(timer);
        cleanupPlayer();
      };
    }
  }, [isScriptLoaded, publicId]);

  return (
    <div className="w-full h-full bg-black relative">
      {}
      <link
        href="https://unpkg.com/cloudinary-video-player@1.10.6/dist/cld-video-player.min.css"
        rel="stylesheet"
      />

      {}
      <Script
        src="https://unpkg.com/cloudinary-video-player@1.10.6/dist/cld-video-player.min.js"
        strategy="afterInteractive"
        onLoad={() => setIsScriptLoaded(true)}
      />

      {}
      {!isPlayerReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="w-10 h-10 border-2 border-neutral-800 border-t-blue-500 rounded-full animate-spin" />
        </div>  
      )}

      {}
      <video ref={videoRef} className="cld-video-player cld-fluid" />
    </div>
  );
}
