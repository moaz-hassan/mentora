"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function VideoPlayer({
  publicId,
  onNextLesson,
  autoPlay = false,
  showNextButton = true,
}) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  // Check if script is already loaded on mount
  const [isScriptLoaded, setIsScriptLoaded] = useState(
    () => typeof window !== "undefined" && !!window.cloudinary
  );
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  // Cleanup function
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

  // Initialize player
  const initPlayer = () => {
    if (!window.cloudinary || !videoRef.current) return;

    // Clean up existing player first
    if (playerRef.current) {
      cleanupPlayer();
    }

    try {
      const cld = window.cloudinary.Cloudinary.new({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      });

      // Initialize Player
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

      // Load Source
      playerRef.current.source(publicId, {
        sourceTypes: ["hls"],
        transformation: { streaming_profile: "hd" },
        info: { title: "" },
      });

      setIsPlayerReady(true);

      // Events
      if (onNextLesson && showNextButton) {
        playerRef.current.on("ended", onNextLesson);
      }
    } catch (error) {
      console.error("Error initializing player:", error);
    }
  };

  // Check if script is already loaded on mount
  useEffect(() => {
    if (window.cloudinary && !isScriptLoaded) {
      setIsScriptLoaded(true);
    }
  }, []);

  // Initialize when script loads or publicId changes
  useEffect(() => {
    if (window.cloudinary) {
      // Small delay to ensure DOM is ready
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
      {/* Load Cloudinary styles */}
      <link
        href="https://unpkg.com/cloudinary-video-player@1.10.6/dist/cld-video-player.min.css"
        rel="stylesheet"
      />

      {/* Load Cloudinary script */}
      <Script
        src="https://unpkg.com/cloudinary-video-player@1.10.6/dist/cld-video-player.min.js"
        strategy="afterInteractive"
        onLoad={() => setIsScriptLoaded(true)}
      />

      {/* Loading indicator */}
      {!isPlayerReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="w-10 h-10 border-2 border-neutral-800 border-t-blue-500 rounded-full animate-spin" />
        </div>  
      )}

      {/* Video element */}
      <video ref={videoRef} className="cld-video-player cld-fluid" />
    </div>
  );
}
