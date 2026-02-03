"use client";

import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import CompleteProfileFormComponent from "@/components/complete-profile-form-component/CompleteProfileFormComponent";
import profileService from "@/lib/services/profileService";
import {useSession} from "next-auth/react";

export default function CompleteProfilePage() {
    const router = useRouter();
    const {data: session, status} = useSession();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status !== "authenticated" || !session?.user?.id) {
            setLoading(false);
            return;
        }
        const checkProfile = async () => {
            try {
                const {data} = await profileService.getProfile(
                    session.user.id,
                    session.user.token
                );
                if (data.birth_date && data.is_rules_accepted) {
                    router.push("/");
                }
            } catch (e) {
                console.error("Profile check failed:", e);
            } finally {
                setLoading(false);
            }
        };

  checkProfile();
}, [status, session, router]);

  if (loading) return <p>Завантаження...</p>;

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bolder",
                margin: "0 auto",
                textAlign: "center",
                width: "100vw",
                height: "100vh",
            }}
        >
            <CompleteProfileFormComponent/>
        </div>
    );
}
