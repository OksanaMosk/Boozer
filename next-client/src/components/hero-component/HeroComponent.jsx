"use client";

import { useEffect, useRef, useState } from "react";
import styles from  "./HeroComponent.module.css";

const HeroComponent = () => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [muted, setMuted] = useState(true);

    useEffect(() => {
        const video = videoRef.current;
        const container = containerRef.current;

        if (!video || !container) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    video.play().catch(() => {
                    });
                } else {
                    video.pause();
                }
            },
            {threshold: 0.4}
        );

        observer.observe(container);

        return () => observer.disconnect();
    }, []);

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !muted;
        setMuted(!muted);
    };

    return (
        <section className={styles.container} ref={containerRef}>
            <video
                ref={videoRef}
                className={styles.video}
                autoPlay
                muted={muted}
                loop
                playsInline
                preload="metadata"
                poster="/images/hero.webp"
            >
                <source src="/videos/hero.webm" type="video/webm"/>
            </video>

            <div className={styles.heroVideoOverlay}/>
            <div className={styles.heroContent}>
                <p className={styles.fadeUp} style={{"--delay": ".15s"}}>
                    Premium Places
                </p>
            </div>
            <button className={styles.videoSoundToggle} onClick={toggleMute}>
                {muted ? "Sound on" : "Sound off"}
            </button>
        </section>
    );
};

export default HeroComponent;

