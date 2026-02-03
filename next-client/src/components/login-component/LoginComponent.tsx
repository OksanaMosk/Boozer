"use client";

import React, {useEffect, useState} from "react";
import { AxiosError } from 'axios';
import Image from "next/image";
import Link from "next/link";
import { authService } from "@/lib/services/authService";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import styles from "./LoginComponent.module.css";
import SocialButtonsComponent from "@/components/social-buttons/SocialButtonsComponent";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";

const LoginComponent = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            await authService.login({email, password});
        } catch (err: unknown) {
            if (err instanceof AxiosError) {
                setErrorMsg(err.response?.data?.detail || "An error occurred");
            } else if (err instanceof Error) {
                setErrorMsg(err.message);
            } else {
                setErrorMsg("An unknown error occurred");
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className={styles.centerContainer}>
            <form onSubmit={handleSubmit} className={`auth ${styles.form}`}>
                <h2 className={styles.title}>Sign In</h2>

                <div className={styles.inputGroup}>

                    <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Email"
                        required
                        className={styles.input}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className={styles.icon}>
                        <Image
                            src="/images/user3.png"
                            alt="User icon"
                            width={24}
                            height={24}
                        />
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        required
                        className={styles.input}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div
                        className={styles.icon}
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        <Image
                            src={showPassword ? "/images/eye2.png" : "/images/noEye2.png"}
                            alt="Toggle password visibility"
                            width={20}
                            height={20}
                        />
                    </div>
                </div>

                <Link href="/forgot-password" className={styles.link}>
                    Forgot Password?
                </Link>
                {errorMsg && <p className={styles.error}>{errorMsg}</p>}

                <button type="submit" className={styles.button} disabled={loading}>
                    {loading ? (
                        <div className={`authButton ${styles.loaderWrapper}`}>
                            <LoaderComponent/>
                        </div>
                    ) : (
                        "Sign In"
                    )}
                </button>

                <div className={styles.bottomContainer}>
                    <p className={styles.registerText}>
                        Dont have an account?{" "}
                        <Link href="/register" className={styles.link}>
                            Sign up
                        </Link>
                    </p>
                        <SocialButtonsComponent/>
                </div>
            </form>
        </div>
    );
};

export default LoginComponent;