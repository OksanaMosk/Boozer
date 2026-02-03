"use client";

import React, { useEffect, useState } from "react";
import { authService } from "@/lib/services/authService";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import AdminUserManagementComponent from "@/components/admin-user-management-component/AdminUserManagementComponent";
import { IUser } from "@/models/IUser";
import styles from './AdminDashboardComponent.module.css';

const AdminDashboardComponent = () => {
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        (async () => {
            try {
                const token = authService.getRefreshToken();
                if (!token) {
                    setError("Please activate your account.");
                    return;
                }
                const userData = await authService.getCurrentUser(token);
                setUser(userData);
            } catch {
                setError("Failed to load user data");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return <div style={{display: "flex", justifyContent: "center", marginTop: 50}}>
        <LoaderComponent/>
    </div>;
    if (error) return <p>{error}</p>;

    return (
        <div className={styles.containerDashboard}>
            <h1 className={styles.title}>ADMIN DASHBOARD</h1>
            {user ? (
                <>
                    <p className={styles.welcome}>
                        Welcome {user.profile?.name} {user.profile?.surname}!
                    </p>
                    <p className={styles.email}>Email: {user.email}</p>
                    <p className={styles.role}>Role: {user.role}</p>
                    <AdminUserManagementComponent/>
                </>
            ) : (
                <p className={styles.noUser}>No user data available.</p>
            )}
        </div>

    );
};

export default AdminDashboardComponent;