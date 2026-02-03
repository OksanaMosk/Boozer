"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { authService } from "@/lib/services/authService";
import { BurgerMenuComponent } from "@/components/burger-menu-component/BurgerMenuComponent";
import { UserInfoComponent } from "@/components/user-info-component/UserInfoComponent";
import ThemesButton from "@/components/themes-button/ThemesButton";
import type { IUser } from "@/models/IUser";
import styles from "./MenuClientComponent.module.css";


export const MenuClientComponent = () => {
    const [user, setUser] = useState<IUser | null>(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark">("dark");
    const pathname = usePathname();

    const menuItems = [
        {href: "/", label: "Home"},
        {href: "/cars", label: "Cars"},
    ];
    const isLoginActive = pathname === "/login";
    const isRegisterActive = pathname === "/register";
    const from = "/";

    const getCookie = (name: string) => {
        return document.cookie
            .split("; ")
            .find((c) => c.startsWith(name + "="))
            ?.split("=")[1];
    };

    const logout = () => {
        document.cookie = "authToken=; path=/; max-age=0";
        document.cookie = "refreshToken=; path=/; max-age=0";
        setUser(null);
        setAuthenticated(false);
    };

    useEffect(() => {
        const loadUser = async () => {
            const authToken = getCookie("authToken");
            const refreshToken = getCookie("refreshToken");

            if (!authToken) {
                logout();
                return;
            }

            try {
                const userData = await authService.getCurrentUser(authToken);
                setUser(userData);
                setAuthenticated(true);
            } catch {
                if (!refreshToken) {
                    logout();
                    return;
                }
                try {
                    const tokens = await authService.refreshToken(refreshToken);
                    const userData = await authService.getCurrentUser(tokens.access);
                    setUser(userData);
                    setAuthenticated(true);
                } catch {
                    logout();
                }
            }
        };

        loadUser();
    }, []);

    const handleLogout = () => logout();
    const handleDark = () => setTheme("dark");
    const handleLight = () => setTheme("light");

    return (
        <div className={styles.header}>
            <nav className={styles.navbar}>
                <Link href="/" className={styles.logoLink}>
                    <Image
                        src="/favicon/android-chrome-512x512.png"
                        alt="logo"
                        width={80}
                        height={80}
                        className={styles.logoImage}
                          loading="eager"
                        priority={true}
                         style={{ objectFit: "contain" }}
                    />
                    <div className={styles.logo}>
                        <h1 className={styles.logoTitle}>Vip Boozer</h1>
                    </div>
                </Link>

                <ul className={styles.menuList}>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "1rem",
                                        color: "#ffffff",
                                        textDecoration: isActive ? "underline" : "none",
                                        cursor: "pointer",
                                        transition: "0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = isActive
                                            ? "#ffffff"
                                            : "#d4af37";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = isActive
                                            ? "#d4af37"
                                            : "#ffffff";
                                    }}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <div className={styles.rightBlock}>
                    {authenticated && user ? (
                        <UserInfoComponent
                            user={{email: user.email, token: user.token}}
                        />
                    ) : (
                        <div className={styles.authLinks}>
                            <Link
                                href={{pathname: "/login", query: {from}}}
                                className={isLoginActive ? styles.activeLink : styles.menuItem}
                            >
                                Sign In
                            </Link>

                            <Link
                                href={{pathname: "/register", query: {from}}}
                                className={isRegisterActive ? styles.activeLink : styles.menuItem}
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}

                    <ThemesButton/>
                </div>

                <button onClick={() => setIsOpen(true)} className={styles.burger}>
                    <div className={styles.burgerLine}/>
                    <div className={styles.burgerLine}/>
                    <div className={styles.burgerLine}/>
                </button>
            </nav>

            <BurgerMenuComponent
                isOpen={isOpen}
                from={from}
                authenticated={authenticated}
                user={user}
                logoutBtnAction={handleLogout}
                closeMenuAction={() => setIsOpen(false)}
                onDarkThemeAction={handleDark}
                onLightThemeAction={handleLight}
                theme={theme}
            />
        </div>
    );
};
