"use client"

import Link from "next/link";
import type { FC } from "react";
import {signOut} from "next-auth/react";
import type { IUser } from "@/models/IUser";
import { UserInfoComponent } from "@/components/user-info-component/UserInfoComponent";
import ThemesButtonComponent from "@/components/themes-button-component/ThemesButtonComponent";
import styles from "./BurgerMenuComponent.module.css";

type BurgerMenuProps = {
    isOpen: boolean;
    from: string;
    authenticated: boolean;
    user: IUser | null;
    logoutBtnAction?: () => void;
    closeMenuAction: () => void;
    onDarkThemeAction: () => void;
    onLightThemeAction: () => void;
    theme: "dark" | "light";
};

export const BurgerMenuComponent: FC<BurgerMenuProps> = ({
                                                             isOpen,
                                                             from,
                                                             authenticated,
                                                             user,
                                                             closeMenuAction,

                                                         }) => {
    if (!isOpen) return null;

    return (
        <nav className={`burgerMenu ${styles.burgerMenu}`}>
            <button onClick={closeMenuAction} className={styles.closeBtn} aria-label="Close menu">
                ×
            </button>

            {!authenticated ? (
                <>
                    <Link
                        href={{pathname: "/login", query: {from}}}
                        onClick={closeMenuAction}
                        className={styles.burgerLink}
                    >
                        Sign In
                    </Link>
                    <Link
                        href={{pathname: "/register", query: {from}}}
                        onClick={closeMenuAction}
                        className={styles.burgerLink}
                    >
                        Sign Up
                    </Link>
                </>
            ) : (
                user && (
                    <UserInfoComponent
                        classNames={{
                            container: styles.burgerUserContainer,
                            avatar: styles.burgerUserAvatar,
                            info: styles.burgerUserInfo,
                            welcome: styles.burgerUserWelcome,
                            user: styles.burgerUserEmail,
                            logoutBtn: styles.burgerUserLogoutBtn,
                        }}
                        onLogoutAction={() => signOut()}
                    />
                )
            )}

            <ThemesButtonComponent/>
        </nav>
    );
};