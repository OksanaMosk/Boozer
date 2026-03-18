"use client";

import React from "react";
import {useUser} from "@/app/contexts/UserProvider";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import styles from "./VisitorDashboardComponent.module.css";

const VisitorDashboardComponent = () => {
    const {user} = useUser();
    if (!user) {
        return <div style={{display: "flex", justifyContent: "center", marginTop: 70}}>
            <LoaderComponent/>
        </div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>BUYER PORTAL</h1>
            <p className={styles.text}>Welcome, {user.profile?.name || "Guest"}!</p>
            <p className={styles.text}>Email: {user.email}</p>
            <p className={styles.text}>Role: {user.role}</p>
            <p className={styles.text}>Age: {user.profile?.birth_date || "Not specified"}</p>
        </div>
    );
};

export default VisitorDashboardComponent;