"use client";

import React, { useState } from "react";
import {useRouter} from "next/navigation";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import styles from "./ForgotPasswordComponent.module.css";

export default function ForgotPasswordComponent() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const url = `${API_BASE_URL}/auth/recovery/`;
            const res = await fetch(url, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email}),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage(data.detail || "Check your email for a recovery link.");

                setTimeout(() => {
                    router.push("/");
                }, 2000);

            } else {
                setMessage(data.detail || "Failed to send recovery email.");
            }
        } catch {
            setMessage("Something went wrong. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.centerContainer}>
            <form onSubmit={handleSubmit} className={`auth ${styles.form}`}>
                <h2 className={styles.title}>Forgot Password</h2>

                <div className={styles.inputGroup}>
                    <label htmlFor="email" className="sr-only">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        required
                        className={styles.input}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                {message && <p className={styles.success}>{message}</p>}
                <button type="submit" className={styles.button} disabled={loading}>
                    {loading ? (
                        <div className={styles.loaderWrapper}>
                            <LoaderComponent/>
                        </div>
                    ) : (
                        "Send Recovery Link"
                    )}
                </button>
            </form>
        </div>
    );
}
