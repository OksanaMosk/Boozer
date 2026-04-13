"use client"

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./ReviewsAdminManagerComponent.module.css";
import {useUser} from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import {PaginationComponent} from "@/components/pagination-component/PaginationComponent";
import {ReviewEditComponent} from "@/components/review-edit-component/ReviewEditComponent";

const ReviewsAdminManagerComponent = () => {
    const { user } = useUser();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingId, setLoadingId] = useState<string | number | null>(null);
    const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get("page") || "1");
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchAllReviews = async () => {
            if (!user?.token) return;
            try {
                setLoading(true);
                const res = await venueServices.reviews.getAllWithFilter(
                    { page: currentPage },
                    { accessToken: user.token }
                );
                const responseData = (res as any).data || res;
                setReviews(responseData.data || []);
                setTotalPages(responseData.total_pages || 1);
            } catch (error) {
                setMessage({ text: "Failed to load all reviews.", isError: true });
            } finally {
                setLoading(false);
            }
        };

        void fetchAllReviews();
    }, [user?.token, currentPage]);

    const handleUpdateReview = (updatedReview: any) => {
        setReviews((prev) =>
            prev.map((r) => (r.id === updatedReview.id ? { ...r, ...updatedReview } : r))
        );
    };

    const handleDeleteReview = async (reviewId: string | number) => {
        if (!user?.token) return;
        if (!confirm("Admin: Are you sure you want to delete this review?")) return;

        setLoadingId(reviewId);
        try {
            await venueServices.reviews.delete(reviewId.toString(), { accessToken: user.token });
            setReviews((prev) => prev.filter((r) => r.id !== reviewId));
            setMessage({ text: "Review deleted by Admin", isError: false });
        } catch (error: any) {
            setMessage({ text: "Delete failed", isError: true });
        } finally {
            setLoadingId(null);
        }
    };

    if (loading) return <div className={styles.loaderWrapper}><LoaderComponent /></div>;

    return (
        <div className={styles.listWrapper}>
            {message && (
                <p className={styles.errorMessage}>
                    {message.isError ? '⚠️ ' : '✅ '}{message.text}
                </p>
            )}
            <div className={styles.reviewsGrid}>
                {reviews.length === 0 ? (
                    <p className={styles.noReviews}>No reviews in the system.</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className={loadingId === review.id ? styles.itemLoading : ""}>
                            <ReviewEditComponent
                                review={review}
                                onUpdate={handleUpdateReview}
                                onDelete={handleDeleteReview}
                            />
                        </div>
                    ))
                )}
            </div>
            {totalPages > 1 && (
                <div className={styles.paginationWrapper}>
                    <PaginationComponent totalPages={totalPages} />
                </div>
            )}
        </div>
    );
};

export default ReviewsAdminManagerComponent;
