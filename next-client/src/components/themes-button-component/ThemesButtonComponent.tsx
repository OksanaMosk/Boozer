"use client"

import { useTheme } from "next-themes";
import {useEffect, useState} from "react";
import Image from "next/image";
import styles from "./ThemesButtonComponent.module.css";

const ThemesButtonComponent = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        }, []);

    if (!mounted) return null;

    return (
        <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className={styles.theme}
        >
            <Image
                src={theme === "light" ? "/images/light.png" : "/images/dark.png"}
                alt={theme === "light" ? "Dark Theme" : "Light Theme"}
                width={50}
                height={50}
                className={
                    theme === "light"
                        ? styles.themeImageLight
                        : styles.themeImageDark
                }
            />

        </button>
    );
};

export default ThemesButtonComponent;