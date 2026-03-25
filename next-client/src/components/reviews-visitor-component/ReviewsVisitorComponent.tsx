"use client"

import React, { useState, useEffect } from "react";
import venueServices from "@/lib/services/venueService";
import {ReviewFormComponent} from "@/components/review-form-component/ReviewFormComponent";
import {ReviewComponent} from "@/components/review-component/ReviewComponent";
import {useUser} from "@/app/contexts/UserProvider";
import styles from "./ReviewsVisitorComponent.module.css"

export const ReviewsVisitorComponent = ({ venueId}: { venueId: string, token?: any }) => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        if (!user?.token || !venueId) return;

        const loadData = async () => {
    try {
        setLoading(true);
        const auth = { accessToken: user.token! };

        const [reviewsRes, ordersRes] = await Promise.all([
            venueServices.reviews.getAllWithFilter({ venue: venueId }, auth),
            venueServices.venues.orders(auth)(venueId).getAll()
        ]);

        const responseData = reviewsRes.data as any;
        const finalReviews = Array.isArray(responseData.data.data)
            ? responseData.data
            : (Array.isArray(responseData) ? responseData : []);
        setReviews(finalReviews);
        const ordersData = ordersRes.data.data;
        const rawOrders = Array.isArray(ordersData) ? ordersData : (ordersData || []);
        setOrders(rawOrders.filter((o: any) => o && o.id));

    } catch (e: any) {
        console.error("Fetch error:", e);
        setReviews([]);
    } finally {
        setLoading(false);
    }
};
        void loadData();
    }, [venueId, user?.token]);


    // НЕ ЗРОБИЛА ЩЕ В ПРОЦЕСІ

    //  const handleLikeReview = async (reviewId: string | number) => {
    //     if (!user?.token) return alert("Please login to like reviews");
    //
    //     try {
    //         const auth = { accessToken: user.token };
    //         await venueServices.reviews.like(reviewId, auth);
    //         setReviews(prev => prev.map(r =>
    //             r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r
    //         ));
    //     } catch (e) {
    //         console.error("Like failed", e);
    //     }
    // };

    // const handleReportReview = async (reviewId: string | number) => {
    //     if (!user?.token) return alert("Please login to report");
    //
    //     const reason = window.prompt("Why are you reporting this review?");
    //     if (!reason) return;
    //
    //     try {
    //         const auth = { accessToken: user.token };
    //         await venueServices.reviews.report(reviewId, { reason }, auth);
    //         alert("Report submitted for moderation.");
    //     } catch (e) {
    //         alert("Failed to send report.");
    //     }
    // };

    // const handleSubmitReview = async (data: any) => {
    //     try {
    //         await venueServices.reviews.create({ ...data, venue: venueId }, { accessToken: user.token });
    //         const updated:AxiosResponse = await venueServices.reviews.getAllWithFilter({ venue: venueId }, { accessToken: user.token });
    //
    //         setReviews(Array.isArray(updated.data) ? updated.data : updated.data.data);
    //     } catch (e) {
    //         alert("Error submitting review");
    //     }
    // };


      if (!user?.token) {
        return <div className={styles.title}>Please login</div>;
    }


    return (
        <div>
            <div style={{ marginTop: "20px" }}>
                {loading || reviews.length === 0 ? (
                    <>
                        <ReviewComponent isPlaceholder placeholderIndex={0}/>
                        <ReviewComponent isPlaceholder placeholderIndex={1}/>
                        <ReviewComponent isPlaceholder placeholderIndex={2}/>
                    </>
                ) : (
                    reviews.map((r) => (
                        <ReviewComponent
                            key={r.id}
                            review={r}
                        //     onLike={handleLikeReview}
                        // onReport={handleReportReview}
                        />
                    ))
                )}
            </div>
             <ReviewFormComponent
                orders={orders}
                venueId={venueId}
                // onSubmit={handleSubmitReview}
            />
            {/*(*/}
            {/*         <p>No reviews of this Venue</p>*/}
            {/*     )*/}
        </div>
    );
};
