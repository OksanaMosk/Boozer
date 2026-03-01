"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation"
import {useSession} from "next-auth/react";
import styles from "./CompleteProfileFormComponent.module.css";
import Image from "next/image";
import DatePickerComponent from "@/components/date-picker-component/DatePickerComponent";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import profileService from "@/lib/services/profileService";

export default function CompleteProfileFormComponent() {
    const [birthDate, setBirthDate] = useState<Date | null>(null);
    const [isRulesAccepted, setIsRulesAccepted] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [errorFields, setErrorFields] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const router = useRouter();
    const {data: session} = useSession();

    const validateBirthDate = (date: Date | null): date is Date => {
        if (!date) return false;

        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        const m = today.getMonth() - date.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
            age--;
        }

        return age >= 18 && age < 150;
    };

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg("");
    setErrorFields({});
    const errors: Record<string, string> = {};

    if (!validateBirthDate(birthDate)) {
        errors.birthDate = "You must be at least 18 years old.";
    }
    if (!isRulesAccepted) {
        errors.rules = "You must accept the rules";
    }
    if (Object.keys(errors).length) {
        setErrorFields(errors);
        return;
    }
    if (!session) {
        setErrorMsg("Session not found.");
        return;
    }
    setIsSubmitting(true);
    try {
        const payload = {
            birth_date: birthDate!.toISOString().split("T")[0],
            is_rules_accepted: isRulesAccepted,
        };
        if (!session.user?.id || !session.user?.accessToken) {
            setErrorMsg("Missing user credentials.");
            return;
        }

        await profileService.updateProfile(
            session.user.id,
            payload,
            session.user.accessToken
        );
        router.push("/visitor");

    } catch (err: any) {
    console.error("Profile save error", err);
    setErrorMsg(`Profile save error: ${err.message}`);
    } finally {
        setIsSubmitting(false);
    }
};

    return (
        <div className={styles.centerContainer}>
            <form onSubmit={handleSubmit} className={`auth ${styles.form}`}>
                <h2 className={styles.title}>Complete Profile</h2>
                <div className={styles.inputGroup}>
                    <div className={styles.calendarWrapper}>
                        <input
                            type="text"
                            placeholder="Birth Date"
                            className={styles.input}
                            value={birthDate ? birthDate.toLocaleDateString() : ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (!value) {
                                    setBirthDate(null);
                                    setIsCalendarOpen(false);
                                } else {
                                    setIsCalendarOpen(true);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Backspace" || e.key === "Delete") {
                                    setBirthDate(null);
                                    setIsCalendarOpen(false);
                                }
                            }}
                            readOnly={false}
                        />
                        <div onClick={() => setIsCalendarOpen(!isCalendarOpen)} className={styles.icon}>
                            <img src="/images/calendar.png" alt="calendar icon" width={20} height={20}
                                   className={styles.img}/>
                        </div>

                        {isCalendarOpen && (
                            <div className={styles.calendarSidebar}>
                                <DatePickerComponent
                                    dateValue={birthDate}
                                    setDateValue={(date) => {
                                        setBirthDate(date);
                                        setIsCalendarOpen(false);
                                    }}
                                    yearRange={[1926, new Date().getFullYear()]}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.inputError}>
                    {errorFields.birthDate && <p className={styles.error}>{errorFields.birthDate}</p>}
                    {errorFields.rules && <p className={styles.error}>{errorFields.rules}</p>}
                    {errorMsg && <p className={styles.error}>{errorMsg}</p>}
                </div>

                <div className={styles.checkboxGroup}>
                    <label className="checkbox">
                        <input
                            type="checkbox"
                            checked={isRulesAccepted}
                            onChange={(e) => setIsRulesAccepted(e.target.checked)}
                            required
                            className={styles.checkboxInput}
                        />
                        <span className={styles.checkboxSpan}></span>
                        I confirm that I am over 18 and accept the rules
                    </label>
                </div>

                <button type="submit" className={styles.button} disabled={isSubmitting}>
                    {isSubmitting ?
                        <div className={`authButton ${styles.loaderWrapper}`}><LoaderComponent/></div>
                        : "Sign Up"}
                </button>
            </form>
        </div>
    );
}