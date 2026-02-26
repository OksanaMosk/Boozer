"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { BurgerMenuComponent } from "@/components/burger-menu-component/BurgerMenuComponent";
import { UserInfoComponent } from "@/components/user-info-component/UserInfoComponent";
import ThemesButtonComponent from "@/components/themes-button-component/ThemesButtonComponent";
import styles from "./MenuClientComponent.module.css";

import {signOut} from "next-auth/react";
import {useUser} from "@/app/contexts/UserProvider";


export const MenuClientComponent = () => {
  const {user} = useUser()
  const authenticated = !!user;
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
    const pathname = usePathname();

    useEffect(() => {
        if (!user) {
        }
    }, [user]);

    const menuItems = [
        {href: "/", label: "Home"},
        {href: "/venues", label: "Venues" },
  ];

  const isLoginActive = pathname === "/login";
  const isRegisterActive = pathname === "/register";
  const from = "/";

    const handleLogout = async () => {
  try {
    localStorage.clear();
    sessionStorage.clear();

    await signOut({
      redirect: true,
      redirectTo: "/",
    });

  } catch (error) {
    console.error("Logout failed:", error);
    window.location.href = "/login";
  }
};

  const handleDark = () => setTheme("dark");
  const handleLight = () => setTheme("light");


    return (
        <div className={styles.header}>
            <nav className={styles.navbar}>
                <Link href="/" className={styles.logoLink}>
                    <img
                        src="/favicon/android-chrome-512x512.png"
                        alt="logo"
                        width={80}
                        height={80}
                        className={styles.logoImage}
                          loading="eager"
                        // priority={true}
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
                            <UserInfoComponent onLogoutAction={handleLogout} />
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

                    <ThemesButtonComponent/>
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
