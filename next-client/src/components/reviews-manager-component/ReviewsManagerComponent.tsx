"use client";

import React, { useEffect, useState } from "react";
import venueServices from "@/lib/services/venueService";
import { useUser } from "@/app/contexts/UserProvider";
import { ReviewComponent } from "@/components/review-component/ReviewComponent";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import {AxiosResponse} from "axios";
import  styles from "./ReviewsManagerComponent.module.css"

export const ReviewsManagerComponent = ({ venueId }: { venueId: string }) => {
    const { user } = useUser();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadReviews = async () => {
        if (!user?.token || !venueId) return;
        try {
            setLoading(true);
            const auth = { accessToken: user.token };
            const res:AxiosResponse = await venueServices.venues.reviews(auth)(venueId).getAll();
            const data = res.data?.data || res.data || [];
            setReviews(data);
        } catch (e) {
            console.error("Failed to load reviews for admin:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
       void loadReviews();
    }, [venueId, user?.token]);

    if (loading) return <LoaderComponent />;

    return (
        <div style={{ padding: "20px" }}>
            <h2 className={styles.title} >Reviews Management</h2>
            {reviews.length > 0 ? (
                reviews.map((r) => (
                    <ReviewComponent
                        key={r.id}
                        review={r}
                        isAdminView={true}
                    />
                ))
            ) : (
                <p>No reviews found for this venue.</p>
            )}
        </div>
    );
};