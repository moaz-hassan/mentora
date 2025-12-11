"use client";

import { CldVideoPlayer } from 'next-cloudinary';
import 'next-cloudinary/dist/cld-video-player.css';


export default function CloudinaryVideoPlayer({
  publicId,
  poster,
  className = "",
  width = 1920,
  height = 1080,
  controls = true,
  autoplay = false,
  muted = false,
  loop = false,
  sourceTypes = ['hls', 'dash', 'mp4'],
  ...props
}) {
  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <CldVideoPlayer
        width={width}
        height={height}
        src={publicId}
        poster={poster}
        controls={controls}
        autoplay={autoplay}
        muted={muted || autoplay} 
        loop={loop}
        sourceTypes={sourceTypes}
        colors={{
          accent: '#3b82f6',
          base: '#000000',
          text: '#ffffff',
        }}
        playbackRates={[0.5, 1, 1.5, 2]}
        bigPlayButton={true}
        fluid={true}
        {...props}
      />
    </div>
  );
}
