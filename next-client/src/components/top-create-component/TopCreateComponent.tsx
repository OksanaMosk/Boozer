"use client";

import React, { useState } from "react";
import venueServices from "@/lib/services/venueService";
import { useUser } from "@/app/contexts/UserProvider";
import styles from "./TopCreateComponent.module.css";

interface Props {
    onCreated: () => void;
}

const TopCreateComponent: React.FC<Props> = ({ onCreated }) => {
    const { user } = useUser();
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async () => {
        const finalName = name.trim();
        if (!finalName || !user?.token) return;

        setError(null);

        try {
            await venueServices.collections({ accessToken: user.token }).create({
                name: finalName,
                category: finalName,
                is_staff_top: true
            });

            setName("");
            setShowForm(false);
            onCreated();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create Staff TOP");
        }
    };

    const toggleForm = () => {
        setShowForm(prev => !prev);
        setError(null);
        setName("");
    };

    return (
        <div className={styles.wrapper}>
            <button className={styles.toggleBtn} onClick={toggleForm}>
                {showForm ? " Cancel" : "Create Staff TOP"}
            </button>

            {showForm && (
                <div className={styles.form}>
                    <div className={styles.inputGroup}>
                        <input
                            className={styles.input}
                            placeholder="Enter Staff TOP name..."
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (error) setError(null);
                            }}
                            autoFocus
                        />
                        <button
                            className={styles.saveBtn}
                            onClick={handleCreate}
                            disabled={!name.trim()}
                        >
                            Save
                        </button>
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                </div>
            )}
        </div>
    );
};

export default TopCreateComponent;
