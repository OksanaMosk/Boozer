"use client";

import React, { useState, useEffect } from "react";
import venueServices from "@/lib/services/venueService";
import { useUser } from "@/app/contexts/UserProvider";
import styles from "./ReviewListEditComponent.module.css";
import { ReviewEditComponent } from "@/components/review-edit-component/ReviewEditComponent";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";

export const ReviewListEditComponent = () => {
    const { user } = useUser();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingId, setLoadingId] = useState<string | number | null>(null);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!user?.token) return;
            try {
               const res = await venueServices.reviews.getAllWithFilter({ user: user.id }, { accessToken: user.token! });
                const responseData = (res as any).data?.data || (res as any).data || res;
                setReviews(Array.isArray(responseData) ? responseData : []);
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            } finally {
                setLoading(false);
            }
        };

        void fetchReviews();
    }, [user?.token]);

    const handleUpdateReview = (updatedReview: any) => {
        setReviews((prev) =>
            prev.map((r) => (r.id === updatedReview.id ? { ...r, ...updatedReview } : r))
        );
    };

    const handleDeleteReview = async (reviewId: string | number) => {
        if (!user?.token) return;
        if (!confirm("Are you sure?")) return;

        setLoadingId(reviewId);
        try {
            await venueServices.reviews.delete(reviewId.toString(), { accessToken: user.token });
            setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        } catch (error) {
            console.error("Delete failed:", error);
        } finally {
            setLoadingId(null);
        }
    };

    if (loading) return <div className={styles.loaderWrapper}><LoaderComponent/></div>;

    return (
        <div className={styles.listWrapper}>
             <h2 className={styles.listTitle}>НЕ доробила</h2>

            <div className={styles.reviewsGrid}>
                {reviews.length === 0 ? (
                    <p className={styles.noReviews}>No reviews found.</p>
                ) : (
                    reviews.map((review) => (
                        <div
                            key={review.id}
                            className={loadingId === review.id ? styles.itemLoading : ""}
                        >
                            <ReviewEditComponent
                                review={review}
                                onUpdate={handleUpdateReview}
                                onDelete={handleDeleteReview}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
