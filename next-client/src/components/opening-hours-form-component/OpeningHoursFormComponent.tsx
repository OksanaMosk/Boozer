"use client";

import React from "react";
import IMask from "imask";
import styles from "./OpeningHoursFormComponent.module.css";

interface OpeningHoursFormProps {
    newVenue: any;
    setNewVenue: React.Dispatch<React.SetStateAction<any>>;
}

const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const OpeningHoursFormComponent: React.FC<OpeningHoursFormProps> = ({
                                                                               newVenue,
                                                                               setNewVenue,
                                                                           }) => {
    const openingHours = newVenue.opening_hours || {};

    const handleTimeChange = (day: string, type: "open" | "close", value: string) => {
        setNewVenue((prev: any) => ({
            ...prev,
            opening_hours: {
                ...prev.opening_hours,
                [day]: {
                    ...(prev.opening_hours?.[day] || {}),
                    [type]: value,
                },
            },
        }));
    };

    return (
        <div className={styles.openingHoursWrapper}>
            {days.map((day) => (
                <div key={day} className={styles.dayRow}>
                    <label className={styles.dayLabel}>{day.toUpperCase()}</label>

                    <input
                        type="text"
                        className={styles.timeInput}
                        value={openingHours[day]?.open ?? ""}
                        placeholder="09:00"
                        onChange={(e) => handleTimeChange(day, "open", e.target.value)}
                        ref={(el) => {
                            if (!el) return;
                            IMask(el, {mask: "00:00"});
                        }}
                    />

                    <span className={styles.separator}>—</span>

                    <input
                        type="text"
                        className={styles.timeInput}
                        value={openingHours[day]?.close ?? ""}
                        placeholder="18:00"
                        onChange={(e) => handleTimeChange(day, "close", e.target.value)}
                        ref={(el) => {
                            if (!el) return;
                            IMask(el, {mask: "00:00"});
                        }}
                    />
                </div>
            ))}
        </div>
    );
};
