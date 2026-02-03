"use client";

import React, {useEffect, useState} from "react";
import {useParams} from "next/navigation";

const ActivateAccount = () => {
    const [isActivated, setIsActivated] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {token} = useParams();
    useEffect(() => {
        if (token) {
            const activationUrl = `http://localhost:8888/api/auth/activate/${token}/`;
            fetch(activationUrl, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to activate account");
                    }
                    return response.json();
                })
                .then((data) => {
                    if (data.detail === "Account activated successfully!") {
                        setIsActivated(true);
                    } else {
                        setError("Failed to activate account");
                    }
                })
                .catch((error: unknown) => {
                    if (error instanceof Error) {
                        setError(error.message);
                    } else {
                        setError("Failed to activate account");
                    }
                });
        }
    }, [token]);

    return (
        <div>
            <h1>Activate Your Account</h1>
            {isActivated ? (
                <p>Your account has been successfully activated!</p>
            ) : (
                <p>{error ? error : "Activating your account..."}</p>
            )}
        </div>
    );
};

export default ActivateAccount;
