"use client";

import React, { useEffect, useState } from "react";
import venueServices from "@/lib/services/venueService";
import { useUser } from "@/app/contexts/UserProvider";
import { ReviewComponent } from "@/components/review-component/ReviewComponent";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import {AxiosResponse} from "axios";
import  styles from "./ReviewsManagerComponent.module.css"
import {useSearchParams} from "next/navigation";
import {PaginationComponent} from "@/components/pagination-component/PaginationComponent";

export const ReviewsManagerComponent = ({ venueId }: { venueId: string }) => {
    const { user } = useUser();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get("page") || "1");
    const [totalPages,setTotalPages] = useState(1);

    const loadReviews = async () => {
        if (!user?.token || !venueId) return;
        try {
            setLoading(true);
            const auth = { accessToken: user.token };
            const res:AxiosResponse = await venueServices.venues.reviews(auth)(venueId).getAll({page: currentPage});
            const resData = res.data;
            setTotalPages(resData.total_pages);
            setReviews(resData.data || []);
        } catch (e) {
            console.error("Failed to load reviews for admin:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
       void loadReviews();
    }, [venueId, user?.token, currentPage]);

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
          {totalPages > 1 && (
                <div className={styles.paginationWrapper}>
                    <PaginationComponent totalPages={totalPages}/>
                </div>
            )}
        </div>
    );
};