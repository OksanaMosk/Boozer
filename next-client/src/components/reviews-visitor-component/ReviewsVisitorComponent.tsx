"use client"

import React, { useState, useEffect } from "react";
import venueServices from "@/lib/services/venueService";
import {ReviewFormComponent} from "@/components/review-form-component/ReviewFormComponent";
import {ReviewComponent} from "@/components/review-component/ReviewComponent";
import {useUser} from "@/app/contexts/UserProvider";
import styles from "./ReviewsVisitorComponent.module.css"

export const ReviewsVisitorComponent = ({venueId}: { venueId: string, token?: any }) => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const {user} = useUser();
    const auth = {accessToken: user?.token || ""};
    const loadData = async () => {
        if (!user?.token || !venueId) return;
        try {
            setLoading(true);
            const [reviewsRes, ordersRes] = await Promise.all([
                venueServices.venues.reviews(auth)(venueId).getAll(),
                venueServices.venues.orders(auth)(venueId).getAll()
            ]);
            const normalize = (res: any) => {
                if (Array.isArray(res)) return res;
                if (res.results) return res.results;
                if (res.data) return res.data;
                return [];
            };
            const rData = normalize(reviewsRes.data);
            const oData = normalize(ordersRes.data);
            console.log("oData:", oData)
            setReviews(Array.isArray(rData) ? rData : []);
            setOrders(Array.isArray(oData) ? oData.filter((o: any) => o?.id) : []);
        } catch (e) {
            console.error("Fetch error:", e);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        void loadData();
    }, [venueId, user?.token]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);
    const handleLikeReview = async (reviewId: string | number) => {
        if (!user?.token) return setMessage({text: "Please Sign In to like reviews", type: 'error'});
        try {
            const res = await venueServices.venues.reviews(auth)(venueId).like(reviewId);
            setReviews(prev => prev.map(r =>
                r.id === reviewId ? {...r, likes_count: res.data.likes_count, is_liked: !r.is_liked} : r
            ));
        } catch (e) {
            console.error("Like failed", e);
        }
    };
    const handleReportReview = async (reviewId: string | number, reportData: { reason: string, comment: string }) => {
        if (!user?.token) return;
        try {
            await venueServices.venues.reviews(auth)(venueId).report(reviewId, reportData);
            setMessage({text: "Report submitted for moderation", type: 'success'});
        } catch (e) {
            setMessage({text: "Failed to send report", type: 'error'});
        }
    };

    const handleSubmitReview = async (data: any) => {
        try {
            if (!user?.token || !venueId) return;
            const formData = new FormData();
            formData.append("rating", String(data.rating));
            formData.append("comment", data.comment || "");

            if (data.orderId) formData.append("order", data.orderId);

            if (data.photos && data.photos.length > 0) {
                data.photos.forEach((file: File) => formData.append("photo", file));
            }

            const res = await venueServices.venues.reviews(auth)(venueId).create(formData);
            await loadData();
            return res;
        } catch (e) {
            setMessage({text: "Error submitting review", type: 'error'});
            console.error(e);
        }
    };

    if (!user?.token) {
        return <div className={styles.title}>Please Sign In</div>;
    }
    return (
        <div>
            {message && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            <div style={{marginTop: "20px"}}>
                {loading ? (
                    <div className={styles.loader}>Loading reviews...</div>
                ) : reviews.length > 0 ? (
                    reviews.map((r) => (
                        <ReviewComponent
                            key={r.id}
                            review={r}
                            onLike={handleLikeReview}
                            onReport={handleReportReview}
                        />
                    ))
                ) : (
                    <p className={styles.noReviews}>No reviews yet.</p>
                )}
            </div>

            <ReviewFormComponent
                orders={orders}
                venueId={venueId}
                onSubmit={handleSubmitReview}
            />
        </div>
    );
}