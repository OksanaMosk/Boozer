"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./PasswordInputComponent.module.css";

export const PasswordInput = ({
                                  value,
                                  onChangeAction,
                                  placeholder,
                              }: {
    value: string;
    onChangeAction: (v: string) => void;
    placeholder: string;
}) => {
    const [show, setShow] = useState(false);

    return (
        <div className={styles.inputGroup}>
            <input
                type={show ? "text" : "password"}
                placeholder={placeholder}
                required
                className={styles.input}
                value={value}
                onChange={(e) => onChangeAction(e.target.value)}
            />
            <div className={styles.icon} onClick={() => setShow(!show)}>
                <img
                    src={show ? "/images/eye2.png" : "/images/noEye2.png"}
                    alt="Toggle password visibility"
                    width={20}
                    height={20}
                />
            </div>
        </div>
    );
};
