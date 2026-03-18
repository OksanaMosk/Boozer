"use client"

import React, {useState} from "react";
import { signIn } from "next-auth/react";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import styles from "./ButtonsSocialComponent.module.css";

const ButtonsSocialComponent: React.FC = () => {
    const [loading, setLoading] = useState<"google" | "facebook" | null>(null);
    const handleSocialSignIn = (provider: "google" | "facebook") => {
        return async (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            setLoading(provider);

            try {
                await signIn(provider, {redirectTo: "/post-login"});
            } catch (error) {
                console.error("Social login failed:", error);
            } finally {
                setLoading(null);
            }
        };
    };

    return (
        <div className={styles.socialButtons}>
            <button
                type="button"
                onClick={handleSocialSignIn("google")}
                className={`${styles.socialButton} ${loading === "google" ? styles.loading : ""}`}
                disabled={loading === "google"}
            >
                {loading === "google" ? (
                    <div className={`authButton ${styles.loaderWrapper}`}>
                        <LoaderComponent/>
                    </div>) : (
                    <div className={styles.socialButtonItem}>
                        <img className={styles.google} src="/images/google.png" alt="Google" width={24} height={24}/>
                        <p>
                            Sign in with Google
                        </p>
                    </div>)
                }

            </button>
            <button
                type="button"
                onClick={handleSocialSignIn("facebook")}
                className={`${styles.socialButton} ${loading === "facebook" ? styles.loading : ""}`}
                disabled={loading === "facebook"}
            >
                {loading === "facebook" ? (
                        <div className={`authButton ${styles.loaderWrapper}`}>
                            <LoaderComponent/>
                        </div>) :
                    (<div className={styles.socialButtonItem}>
                        <img src="/images/facebook.png" alt="Facebook" width={24} height={24}/>
                        <p>
                            Sign in with Facebook
                        </p>
                    </div>)
                }
            </button>
        </div>
    );
};

export default ButtonsSocialComponent;