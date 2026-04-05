'use client';

import {useUser} from "@/app/contexts/UserProvider";
import styles from "./UserInfoComponent.module.css";
import {useEffect} from "react";


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
  const {user} = useUser()

      useEffect(() => {
        const handleUnauthorized = () => {
            onLogoutAction();
        };
        window.addEventListener("unauthorized-access", handleUnauthorized);
        return () => {
            window.removeEventListener("unauthorized-access", handleUnauthorized);
        };
    }, [onLogoutAction]);

    if (!user) return null;

    const avatarLetter = user.email ? user.email[0].toUpperCase() : "?";
    const getPhotoUrl = (avatarUrl?: string | null) => {
        if (!avatarUrl || avatarUrl === "" || avatarUrl === "EMPTY") return null;
        if (avatarUrl.startsWith("http")) return avatarUrl;
        const cleanPath = avatarUrl.replace(/^\/?(api\/media\/)?/, "");
        return `http://localhost:8888/api/media/${cleanPath}?t=${Date.now()}`;
    };

    const photoUrl = getPhotoUrl(user.profile?.avatar);

    return (
        <div className={`${styles.container} ${classNames.container ?? ""}`}>
                <div className={`${styles.avatar} ${classNames.avatar ?? ""}`}>
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt="Avatar"
                            className={styles.avatarImage}
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                            }}
                        />
                    ) : (
                        <span>{avatarLetter}</span>
                    )}
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



// 'use client';
//
// import {useUser} from "@/app/contexts/UserProvider";
// import styles from "./UserInfoComponent.module.css";
//
//
// type UserInfoProps = {
//     onLogoutAction: () => void;
//     classNames?: {
//         container?: string;
//         avatar?: string;
//         info?: string;
//         welcome?: string;
//         user?: string;
//         logoutBtn?: string;
//
//     };
// };
//
// export const UserInfoComponent = ({onLogoutAction, classNames = {}}: UserInfoProps) => {
//   const {user} = useUser()
//     if (!user) return null;
//
//
//     const avatarLetter = user.email ? user.email[0].toUpperCase() : "?";
//
//
//     const getPhotoUrl = (avatarUrl?: string | null) => {
//         if (!avatarUrl || avatarUrl === "" || avatarUrl === "EMPTY") return null;
//         if (avatarUrl.startsWith("http")) return avatarUrl;
//         const cleanPath = avatarUrl.replace(/^\/?(api\/media\/)?/, "");
//         return `http://localhost:8888/api/media/${cleanPath}?t=${Date.now()}`;
//     };
//
//     const photoUrl = getPhotoUrl(user.profile?.avatar);
//
//     return (
//         <div className={`${styles.container} ${classNames.container ?? ""}`}>
//                 <div className={`${styles.avatar} ${classNames.avatar ?? ""}`}>
//                     {photoUrl ? (
//                         <img
//                             src={photoUrl}
//                             alt="Avatar"
//                             className={styles.avatarImage}
//                             onError={(e) => {
//                                 (e.target as HTMLImageElement).style.display = "none";
//                             }}
//                         />
//                     ) : (
//                         <span>{avatarLetter}</span>
//                     )}
//                 </div>
//             <div className={`${styles.info} ${classNames.info ?? ""}`}>
//                 <p className={`${styles.welcome} ${classNames.welcome ?? ""}`}>Welcome,</p>
//                 <p className={`${styles.user} ${classNames.user ?? ""}`}>{user.email}</p>
//
//                 <button
//                     onClick={onLogoutAction}
//                     className={`${styles.logoutBtn} ${classNames.logoutBtn ?? ""}`}
//                 >
//                     Sign out
//                 </button>
//             </div>
//         </div>
//     );
// };