"use client";

import React, { useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import Link from "next/link";
import { authService } from "@/lib/services/authService";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import ButtonsSocialComponent from "@/components/buttons-social-component/ButtonsSocialComponent";
import styles from "./LoginComponent.module.css";

const LoginComponent = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            await authService.login({email, password});
            const callbackUrl = searchParams.get('callbackUrl');
            if (callbackUrl) {
                return router.push(callbackUrl);
            }
            router.push("/dashboard");

        } catch (err: unknown) {
            if (err instanceof Error) setErrorMsg(err.message);
            else setErrorMsg("Unknown error");
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
                        <img
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
                        <img
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
                    <ButtonsSocialComponent/>
                </div>
            </form>
        </div>
    );
};

export default LoginComponent;