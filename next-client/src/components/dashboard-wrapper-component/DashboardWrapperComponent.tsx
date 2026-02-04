"use client";

import React, { useEffect, useState, ReactElement } from "react";
import { useSession } from "next-auth/react";
import { loadUser } from "@/utils/authUtils";
import { IUser } from "@/models/IUser";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import styles from "./DashboardWrapperComponent.module.css";

interface DashboardWrapperProps {
    children: React.ReactElement<{ user?: IUser | null }>;
}

export const DashboardWrapper = ({ children }: DashboardWrapperProps) => {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<IUser | null>(null);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (status !== "authenticated") return;

        const fetchUser = async () => {
            try {
                const userData = await loadUser(session?.user);
                setUser(userData);
            } catch (err: any) {
                setError(err.message || "Failed to load user");
            }
        };

        fetchUser();
    }, [session, status]);

    if (status === "loading") {
        return (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
                <LoaderComponent />
            </div>
        );
    }

    if (error) return <p className={styles.errorText}>{error}</p>;

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.dashboardContent}>
                {React.cloneElement(children, { user })}
            </div>
        </div>
    );
};
