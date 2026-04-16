"use client"

import React, {useEffect, useMemo, useState} from "react";
import {useSearchParams} from "next/navigation";
import {useUser} from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import {AxiosResponse} from "axios";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import {ReviewComponent} from "@/components/review-component/ReviewComponent";
import {PaginationComponent} from "@/components/pagination-component/PaginationComponent";
import {ReviewFormComponent} from "@/components/review-form-component/ReviewFormComponent";
import styles from "./ReviewsGlobalComponent.module.css"

export const ReviewsGlobalComponent = ({ venueId }: { venueId: string, token?: any }) => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const  searchParams = useSearchParams();
    const  currentPage= Number( searchParams.get("page") || 1);
    const [totalPage,setTotalPage] = useState(1);
    const [userAllReviews, setUserAllReviews] = useState<any[]>([]);
    const { user } = useUser();
    const auth = { accessToken: user?.token || "" };

    const loadData = async () => {
        if (!user?.token || !venueId) return;
        try {
            setLoading(true);
             setMessage(null);
            const [reviewsRes, ordersRes, userReviewsRes] = await Promise.all([
                venueServices.venues.reviews(auth)(venueId).getAll({page: currentPage}),
                venueServices.venues.orders(auth)(venueId).getAll({size: 100}),
                venueServices.venues.reviews(auth)(venueId).getAll({user: user.id, size: 100})
            ]);


            const normalize = (res: any) => {
                if (Array.isArray(res)) return res;
                if (res.results) return res.results;
                if (res.data) return res.data;
                return [];
            };

            const rData = reviewsRes.data;
            const oData = normalize(ordersRes.data);
            setReviews(rData.data || []);
            const uData = userReviewsRes.data.data || [];
            setUserAllReviews(uData);
            setTotalPage(rData.total_pages || 1);

            setOrders(Array.isArray(oData)
                ? oData.filter((o: any) => o?.id && String(o.user) === String(user?.id))
                : []
            );
        } catch (e) {
           setMessage({ text: "Failed to load reviews data.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadData();
  }, [venueId, user?.token, currentPage]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const reviewedOrderIds = useMemo(() => {
        return userAllReviews.map(r => r.order).filter(Boolean);
    }, [userAllReviews]);


    const availableOrders = useMemo(() => {
        return orders.filter(o =>
            o.status === "CONFIRMED" && !reviewedOrderIds.includes(o.id)
        );
    }, [orders, reviewedOrderIds]);


    const handleLikeReview = async (reviewId: string | number) => {
        if (!user?.token) return setMessage({ text: "Please Sign In to like reviews", type: 'error' });
        try {
            const res = await venueServices.venues.reviews(auth)(venueId).like(reviewId);
            setReviews(prev => prev.map(r =>
                r.id === reviewId ? { ...r, likes_count: res.data.likes_count, is_liked: !r.is_liked } : r
            ));
        } catch (e) {
            setMessage({ text: "Could not update like status.", type: 'error' });
        }
    };

    const handleReportReview = async (reviewId: string | number, reportData: { reason: string, comment: string }) => {
        if (!user?.token) return;
        try {
            await venueServices.venues.reviews(auth)(venueId).report(reviewId, reportData);
            setMessage({ text: "Report submitted for moderation", type: 'success' });
        } catch (e) {
            setMessage({ text: "Failed to send report", type: 'error' });
        }
    };

    const handleSubmitReview = async (data: any) => {

        try {
            if (!user?.token || !venueId) return;
            const auth = { accessToken: user.token };
            setIsCreating(true);

            if (data.isPhotoUpdate) {
                const res = await venueServices.venues.reviews(auth)(venueId)
                    .update(data.reviewId, data.formData);
                await loadData();
                return res;
            }
            const formData = new FormData();
            const fields: any = {
                rating: String(data.rating || 0),
                comment: data.comment || "",
                order: String(data.order || ""),
                food_rating: String(data.food_rating || 0),
                service_rating: String(data.service_rating || 0),
                atmosphere_rating: String(data.atmosphere_rating || 0),
                cleanliness_rating: String(data.cleanliness_rating || 0),
                value_rating: String(data.value_rating || 0),
            };

            Object.entries(fields).forEach(([key, value]: [string, any]) => {
                formData.append(key, value);
            });

            if (data.photo) {
                formData.append("photo", data.photo);
            }
            const res:AxiosResponse = await venueServices.venues.reviews(auth)(venueId).create(formData);
            return res;
        } catch (e: any) {
            setIsCreating(false);

            const serverError = e?.response?.data?.order?.[0] || e?.response?.data?.detail || "Error processing review";
            setMessage({ text: serverError, type: 'error' });
            throw e;
        }
    };

    const handlePhotosDone = () => {
        setIsCreating(false);
        void loadData();
    };

    const userConfirmedOrdersCount = orders.filter(o => {
        return o.status === "CONFIRMED" && String(o.user) === String(user?.id);
    }).length;

    const userReviewsCount = userAllReviews.length;
    const canPostNewReview = userConfirmedOrdersCount > userReviewsCount;
    const shouldShowForm = canPostNewReview || isCreating;

    if (!user?.token) {
        return <div className={styles.title}>Please Sign In</div>;
    }

    return (
        <div>
            <h1 className={styles.title}>Reviews</h1>
            {message && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            <div style={{ marginTop: "20px" }}>
                {loading ? (
                    <div className={styles.loaderWrapper}><LoaderComponent /></div>
                ) : (
                    reviews.length > 0 ? (
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
                    )
                )}
            </div>
            {totalPage > 1 && (
                <div className={styles.paginationWrapper}>
                    <PaginationComponent totalPages={totalPage}/>
                </div>
            )}

            {!loading && (
                shouldShowForm ? (
                    <ReviewFormComponent
                        orders={availableOrders}
                        venueId={venueId}
                        onSubmit={handleSubmitReview}
                        onUploadComplete={handlePhotosDone}
                    />
                ) : (
                    userConfirmedOrdersCount > 0 && (
                        <p className={styles.limitReached}>
                            You have already submitted reviews for all your confirmed visits.
                        </p>
                    )
                )
            )}
        </div>
    );
};
