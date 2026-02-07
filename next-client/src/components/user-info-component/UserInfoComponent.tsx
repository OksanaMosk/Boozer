'use client';

import styles from "./UserInfoComponent.module.css";
import { useSession} from "next-auth/react";
type UserInfoProps = {
    onLogoutAction: () => void;
    classNames?: {
        container?: string;
        avatar?: string;
        info?: string;
        welcome?: string;
        user?: string;
        logoutBtn?: string;

    };
};


export const UserInfoComponent = ({onLogoutAction, classNames = {}}: UserInfoProps) => {
    const {data: session} = useSession();
    const user = session?.user;
    if (!session?.user) return null;
    if (!user) return null;
    console.log(user);
    console.log("User Profile:", user?.profile);

    const avatarLetter = user.email ? user.email[0].toUpperCase() : "?";

    return (
        <div className={`${styles.container} ${classNames.container ?? ""}`}>
            <div className={`${styles.avatar} ${classNames.avatar ?? ""}`}>
                {avatarLetter}
            </div>

            <div className={`${styles.info} ${classNames.info ?? ""}`}>
                <p className={`${styles.welcome} ${classNames.welcome ?? ""}`}>Welcome,</p>
                <p className={`${styles.user} ${classNames.user ?? ""}`}>{user.email}</p>

                <button
                   onClick={onLogoutAction}
                    className={`${styles.logoutBtn} ${classNames.logoutBtn ?? ""}`}
                >
                    Sign out
                </button>
            </div>
        </div>
    );
};