"use client";

import React from "react";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import AdminUserManagementComponent from "@/components/admin-user-management-component/AdminUserManagementComponent";
import styles from './AdminDashboardComponent.module.css';
import {useUser} from "@/app/contexts/UserProvider";

const AdminDashboardComponent = () => {
    const {user} = useUser();
// console.log('User:', user);

    if (!user) {
        return <div style={{display: "flex", justifyContent: "center", marginTop: 70}}>
            <LoaderComponent/>
        </div>;
    }

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