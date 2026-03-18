"use client";

import React, {useEffect, useState} from "react";
import {AxiosResponse} from "axios";
import {useUser} from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import styles from "./BoozerProgressBarComponent.module.css";

interface Props {
    venueId: number | string;
    currentStep: number;
    orderId?: number | null;
}

const steps = [
    {id: 1, label: "Venue"},
    {id: 2, label: "Info"},
    {id: 3, label: "Menu"},
    {id: 4, label: "Table"},
    {id: 5, label: "Extra"},
    {id: 6, label: "Route"},
    {id: 7, label: "Finish"},
];

export const BoozerProgressBarComponent: React.FC<Props> = ({currentStep, orderId, venueId}) => {
    const [seconds, setSeconds] = useState<number | null>(null);
    const {user} = useUser()

    useEffect(() => {
        const fetchTimer = async () => {
            if (!user?.token || !orderId || !venueId) {
                setSeconds(null);
                return;
            }

            try {
                const response: AxiosResponse = await venueServices.venues
                    .orders({accessToken: user.token})(venueId.toString())
                    .get(orderId);

                const dataRes = response.data;
                if (dataRes.remaining_seconds) {
                    setSeconds(dataRes.remaining_seconds);
                }
            } catch (error) {
                console.error("Не вдалося завантажити таймер:", error);
            }
        };

        void fetchTimer();
    }, [orderId, venueId, user?.token])

    useEffect(() => {
        if (seconds === null || seconds <= 0) return;

        const interval = setInterval(() => {
            setSeconds((prev) => (prev !== null ? prev - 1 : null));
        }, 1000);

        return () => clearInterval(interval);
    }, [seconds]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.progressLine}>
                <div
                    className={styles.fill}
                    style={{width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`}}
                />

                {steps.map((step) => (
                    <div key={step.id} className={styles.stepWrapper}>
                        <div
                            className={`${styles.circle} 
                ${currentStep >= step.id ? styles.active : ""} 
                ${currentStep > step.id ? styles.completed : ""}`}
                        >
                            <p className={styles.step}>{currentStep > step.id ? "✓" : step.id}</p>
                        </div>
                        <span className={`${styles.label} ${currentStep >= step.id ? styles.activeLabel : ""}`}>
              {step.label}
            </span>
                    </div>
                ))}
            </div>
            {seconds !== null && (
                <div className={`${styles.time} ${seconds < 180 ? styles.danger : ""}`}>
                    {formatTime(seconds)}
                </div>
            )}
        </div>
    );
};
