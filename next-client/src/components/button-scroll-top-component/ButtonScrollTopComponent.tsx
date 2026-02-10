"use client";

import { useEffect, useState } from "react";
import styles from "./ButtonScrollTopComponent.module.css";

export const ButtonScrollTopComponent = () => {
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            const scrollY = window.scrollY;
            const partPage = document.body.scrollHeight / 6;
            setShowButton(scrollY > partPage);
        };

        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    if (!showButton) return null;

    return (
        <button
            onClick={() => window.scrollTo({top: 0, behavior: "smooth"})}
            className={styles.scrollToTopBtn}
            aria-label="Scroll to top"
            title="Scroll to top"
        >
            ⇧
        </button>
    );
};