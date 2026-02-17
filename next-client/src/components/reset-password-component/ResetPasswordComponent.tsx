"use client";

import React, { useState } from "react";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./ResetPasswordComponent.module.css";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage("");

        if (!token) {
            setMessage("Invalid token.");
            return;
        }

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/recovery/${token}/`, {

                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({password}),
            });
            const data = await res.json();
            if (res.ok) {
                router.push("/login/");
            } else {
                setMessage(data.detail || "Error resetting password");
            }
        } catch {
            setMessage("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.centerContainer}>
            <form onSubmit={handleSubmit} className={`auth ${styles.form}`}>
                <h2 className={styles.title}>Reset Password</h2>
                <p className={styles.reset}>Please enter your new password and confirm it below.</p>

                <div className={styles.inputGroup}>
                    <label htmlFor="password" className="sr-only">New Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        placeholder="New Password"
                        required
                        className={styles.input}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="confirmPassword" className="sr-only">Confirm New Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm New Password"
                        required
                        className={styles.input}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>

                {message && <p className={styles.error}>{message}</p>}

                <button type="submit" className={styles.button} disabled={loading}>
                    {loading ? (
                        <div className={styles.loaderWrapper}>
                            <LoaderComponent/>
                        </div>
                    ) : (
                        "Reset Password"
                    )}
                </button>
            </form>
        </div>
    );
}
