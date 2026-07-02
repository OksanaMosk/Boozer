"use client";

import React from "react";
import styles from "./ProfileComponent.module.css";
import {IUser} from "@/models/IUser";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";

interface ProfileProps {
    user: IUser;
    actions?: React.ReactNode;
    loading?: boolean;
}

const ProfileComponent: React.FC<ProfileProps> = ({
    user,
    actions,
    loading
}) => {
      if (loading) return <div className={styles.loader}><LoaderComponent/></div>;

    const roleLabels: Record<IUser['role'], string> = {
        visitor: "Gold Member",
        venue_admin: "Venue Admin",
        admin: "Admin "
    };
    const birthday = user?.profile?.birth_date;

const calculateAge = (date: string | Date) => {
    if (!date) return null;
    const today = new Date();
    const birthDate = new Date(date);
    if (isNaN(birthDate.getTime())) return null;

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const fullName = user?.profile
    ? `${user.profile.name || ""} ${user.profile.surname || ""}`.trim()
    : "Anonymous User";

const getPhotoUrl = (avatarUrl?: string | null) => {

    if (!avatarUrl || avatarUrl === "EMPTY") return "/default-avatar.png";
    if (avatarUrl.startsWith("http")) return avatarUrl;
    const cleanPath = avatarUrl.replace(/^\//, "");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const baseDomain = apiUrl ? apiUrl.replace(/\/api$/, '') : 'http://localhost:8888';
    return `${baseDomain}/${cleanPath}?t=${Date.now()}`;

};

    return (
        <>
            <header className={styles.container}>
                <div className={styles.profileMain}>
                    <div className={styles.avatarWrapper}>
                        {user?.profile?.avatar && user.profile.avatar !== "EMPTY" ? (
                            <img
                                key={user.profile.avatar}
                                src={getPhotoUrl(user?.profile?.avatar)}
                                alt="Avatar"
                                className={styles.avatarImage}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/default-avatar.png";
                                }}
                            />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                {user?.profile?.name?.[0]}{user?.profile?.surname?.[0]}
                            </div>
                        )}
                    </div>
                    <div className={styles.infoContent}>
                        <div className={styles.nameRow}>
                            <h1 className={styles.userName}>{fullName}</h1>
                            <span className={`${styles.roleBadge} ${styles[user.role]}`}>
                            {user.role === 'admin' && <span className={styles.crown}>★</span>}
                                {roleLabels[user.role]}
                        </span>
                        </div>

                        <div className={styles.contactRow}>
                            <p className={styles.email}>{user.email}</p>
                            <p className={styles.ageBadge}>
                                {birthday
                                    ? `${calculateAge(birthday)} years old`
                                    : 'No age'}
                            </p>
                            {user.profile?.phone && (
                                    <div className={styles.statsGrid}>
                                        <span className={styles.phone}>{user.profile.phone}</span>
                                </div>

                            )}
                        </div>

                    </div>
                </div>

                <div className={styles.actionsWrapper}>
                    {actions}
                </div>
            </header>
        </>
    );
};

export default ProfileComponent;
