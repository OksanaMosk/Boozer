"use client";

import React from "react";
import styles from "./BuyerDashboardComponent.module.css";
import { IUser } from "@/models/IUser";

interface BuyerDashboardProps {
    user?: IUser | null;
}

const BuyerDashboardComponent = ({ user }: BuyerDashboardProps) => {
    if (!user) {
        return <p>No user data available.</p>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>BUYER PORTAL</h1>
            <p className={styles.text}>Welcome, {user.name}!</p>
            <p className={styles.text}>Email: {user.email}</p>
            <p className={styles.text}>Role: {user.role}</p>
            <p className={styles.text}>
                Age: {new Date(user.birth_date).toLocaleDateString()}
            </p>
        </div>
    );
};

export default BuyerDashboardComponent;


