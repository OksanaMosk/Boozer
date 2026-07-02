"use client";

import React, {useEffect, useState} from "react";
import {useParams} from "next/navigation";

const ActivateAccount = () => {
    const [isActivated, setIsActivated] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {token} = useParams();
    useEffect(() => {
        if (token) {
	    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const activationUrl = `${apiUrl}/auth/activate/${token}/`;


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
                    if (data && (data.id || data.email || data.status === 'info')) {
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
