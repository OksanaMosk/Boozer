"use client";

import React, {useEffect, useState} from "react";
import {authService} from "@/lib/services/authService";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import ManagerUserManagementComponent
    from "@/components/manager-user-management-component/ManagerUserManagementComponent";
import {IUser} from "@/models/IUser";
import styles from "./ManagerDashboardComponent.module.css";


export const ManagerDashboardComponent = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1];

      if (!token) {
        setError("Please activate your account.");
        setLoading(false);
        return;
      }

      try {
        const userData = await authService.getCurrentUser(token);
        setUser(userData);
      } catch {
        const refreshToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("refreshToken="))
          ?.split("=")[1];

        if (!refreshToken) {
          setError("Please log in again.");
          setLoading(false);
          return;
        }

        try {
          const tokens = await authService.refreshToken(refreshToken);
          const userData = await authService.getCurrentUser(tokens.access);
          setUser(userData);
        } catch {
            setError("Your session has expired. Please log in again.");
        }
      } finally {
          setLoading(false);
      }
    };

      loadUser();
  }, []);

    if (loading)
        return <div style={{display: "flex", justifyContent: "center", marginTop: 50}}>
            <LoaderComponent/>
        </div>;

    if (error) return <p className={styles.error}>{error}</p>;

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>MANAGER DASHBOARD</h1>
            {user ? (
                <div className={styles.userInfo}>
                    <p className={styles.text}>
                        Welcome, {user.profile?.name} {user.profile?.surname}!
                    </p>
                    <p className={styles.text}>Email: {user.email}</p>
                    <p className={styles.text}>Role: {user.role}</p>
                    {user.profile?.birth_date && <p className={styles.text}>Age: {user.profile.birth_date.toString()}</p>}
                    <ManagerUserManagementComponent/>
                </div>
            ) : (
                <p className={styles.text}>No user data available.</p>
            )}
        </div>
    );
};

export default ManagerDashboardComponent;
