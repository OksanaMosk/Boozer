"use client";

import React, { useState, useEffect } from "react";
import venueServices from "@/lib/services/venueService";
import { useUser } from "@/app/contexts/UserProvider";
import styles from "./ReviewListEditComponent.module.css";
import { ReviewEditComponent } from "@/components/review-edit-component/ReviewEditComponent";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import {PaginationComponent} from "@/components/pagination-component/PaginationComponent";
import {useSearchParams} from "next/navigation";
import {ButtonScrollBottomComponent} from "@/components/button-scroll-bottom-component/ButtonScrollBottomComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";

export const ReviewListEditComponent = () => {
    const { user } = useUser();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingId, setLoadingId] = useState<string | number | null>(null);
    const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get("page") || "1");
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
    if (message) {
        const timer = setTimeout(() => setMessage(null), 4000);
        return () => clearTimeout(timer);
    }
}, [message]);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!user?.token) return;
            try {
               const res = await venueServices.reviews.getAllWithFilter({ user: user.id, page: currentPage }, { accessToken: user.token! });
                const responseData = (res as any).data || res;
                setReviews(responseData.data || []);
                setTotalPages(responseData.total_pages || 1);
            } catch (error) {
                 setMessage({ text: "Failed to load reviews.", isError: true });
            } finally {
                setLoading(false);
            }
        };

        void fetchReviews();
     }, [user?.token, currentPage]);

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
             setMessage({ text: "Review deleted successfully", isError: false });
        } catch (error:any) {
            const errorMsg = error.response?.data?.detail || "Delete failed";
            setMessage({ text: errorMsg, isError: true });
        } finally {
            setLoadingId(null);
        }
    };

    if (loading) return <div className={styles.loaderWrapper}><LoaderComponent/></div>;

    return (
        <div className={styles.listWrapper}>
            {message && (
                    <p  className={styles.errorMessage}>
                        {message.isError ? '⚠️ ' : '✅ '}{message.text}
                    </p>
                )}
               <ButtonScrollBottomComponent/>
            <div className={styles.reviewsGrid}>
                {reviews.length === 0 ? (
                    <p className={styles.titleNo}>No reviews found.</p>
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
           {totalPages > 1 && (
                <div className={styles.paginationWrapper}>
                    <PaginationComponent totalPages={totalPages}/>
                </div>
            )}
            <ButtonScrollTopComponent/>
        </div>
    );
};
