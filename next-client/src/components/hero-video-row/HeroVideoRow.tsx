"use client";

import { useRef, useState, useEffect } from "react";
import styles from "./HeroVideoRow.module.css";

type VideoItem = {
  id: number;
  src: string;
  poster?: string;
};

const videos: VideoItem[] = [
  { id: 1, src: "/videos/video1.webm", poster: "/images/poster1.webp" },
  { id: 2, src: "/videos/video2.webm", poster: "/images/poster2.webp" },
  { id: 3, src: "/videos/video3.webm", poster: "/images/poster3.webp" },
  { id: 4, src: "/videos/video4.webm", poster: "/images/poster4.webp" },
];

export default function HeroVideoRow() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeSoundIndex, setActiveSoundIndex] = useState<number | null>(null);

  const handleMouseEnter = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;
    video.play().catch(() => {});
  };

  const handleMouseLeave = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    if (activeSoundIndex === index) return;

    video.pause();
    video.currentTime = 0;
  };

  const toggleSound = (index: number) => {
    const currentVideo = videoRefs.current[index];
    if (!currentVideo) return;

    // Вимикаємо звук у всіх інших відео
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i !== index) video.muted = true;
    });

    const enableSound = activeSoundIndex !== index;
    currentVideo.muted = !enableSound;
    currentVideo.play().catch(() => {});

    setActiveSoundIndex(enableSound ? index : null);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (!target.closest(`.${styles.videoSoundToggle}`)) {
        videoRefs.current.forEach((video) => {
          if (video) video.muted = true;
        });
        setActiveSoundIndex(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <section className={styles.wrapper}>
      <div className={styles.row}>
        {videos.map((video, index) => (
          <div
            key={video.id}
            className={styles.card}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={() => handleMouseLeave(index)}
          >
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              className={styles.video}
              loop
              playsInline
              preload="metadata"
              poster={video.poster}
              muted={activeSoundIndex !== index}
            >
              <source src={video.src} type="video/webm" />
            </video>

            <div className={styles.overlay}>
              <button
                className={styles.videoSoundToggle}
                onClick={() => toggleSound(index)}
              >
                <img
                  src={
                    activeSoundIndex === index
                      ? "/images/audio.png"
                      : "/images/no-audio.png"
                  }
                  alt={activeSoundIndex === index ? "Sound On" : "Sound Off"}
                  width={16}
                  height={16}
                  className={styles.soundIcon}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
