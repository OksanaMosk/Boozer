"use client";

import { useEffect, useState } from "react";
import styles from "./ButtonScrollBottomComponent.module.css";

export const ButtonScrollBottomComponent = () => {
    const [showButton, setShowButton] = useState(true);

    useEffect(() => {
        const onScroll = () => {
            const scrollY = window.scrollY;
            const halfPage = document.body.scrollHeight / 2;
            setShowButton(scrollY < halfPage);
        };

        window.addEventListener("scroll", onScroll);
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    if (!showButton) return null;

    return (
        <button
            onClick={() => window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth"
            })}
            className={styles.scrollToBottomBtn}
            aria-label="Scroll to bottom"
        >
            ⇩
        </button>
    );
};
