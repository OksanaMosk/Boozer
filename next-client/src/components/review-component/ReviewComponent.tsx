"use client"

import styles from "./ReviewComponent.module.css";
import { ReviewStarsComponent } from "@/components/review-stars-component/ReviewStarsComponent";
import {NewsGalleryComponent} from "@/components/news-gallery-compopnent/NewsGalleryComponent";
import React, {useState} from "react";


const MOCK_REVIEWS = [
    {
        id: "mock-1",
        user: { name: "Alex Thompson" },
        rating: 5.0,
        text: "The food was absolutely incredible! Best service I've had in a while. The atmosphere is very cozy.",
        sub_ratings: { food: 5, service: 5, atmosphere: 5, cleanliness: 5, value: 5 },
       photos: [
    "/images/noPosterVenue.webp",
    "/images/noPosterMenu.webp",
    "/images/noPosterVenue.webp"
],
        likes: 12,
        status: "is_active",
    },
    {
        id: "mock-2",
        user: { name: "Maria Garcia" },
        rating: 4.5,
        text: "Great experience! The text is now stretched to full width as requested. Very satisfied with the cleanliness and value.",
        sub_ratings: { food: 5, service: 4, atmosphere: 5, cleanliness: 5, value: 4 },
        photos: [
            "/images/noPosterVenue.webp",
            "/images/noPosterMenu.webp",
            "/images/noPosterVenue.webp"
        ],
        likes: 8,
        status: "is_active",
    },
    {
        id: "mock-3",
        user: { name: "Jason Derulo" },
        rating: 5.0,
        status: "active",
        text: "Best service ever. Atmosphere is top notch. Highly recommended for family dinners!",
        sub_ratings: { food: 5, service: 5, atmosphere: 5, cleanliness: 5, value: 5 },
        photos: [],
        likes: 12
    }
];

export const ReviewComponent = ({review, onLike, onReport, isPlaceholder, placeholderIndex = 0}: any) => {
    const data = isPlaceholder ? MOCK_REVIEWS[placeholderIndex] : review;
    const s = data.sub_ratings || {};
    const [likesCount, setLikesCount] = useState(data?.likes || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [showReportForm, setShowReportForm] = useState(false);
    const [reportReason, setReportReason] = useState("spam");
    const [isReported, setIsReported] = useState(false);

    const [reportComment, setReportComment] = useState("");
    if (!data) return null;

    const images = (data.photos || []).map((p: any) => ({
        image: typeof p === 'string' ? p : (p.url || p.image || p)
    }));


     const handleLike = async () => {
        try {
            if (onLike) await onLike(data.id);
            setLikesCount((prev: number) => isLiked ? prev - 1 : prev + 1);
            setIsLiked(!isLiked);
        } catch (error) {
            console.error("Like failed", error);
        }
    };

    const handleReport = () => {
        const confirmReport = window.confirm("Do you want to report this review for inappropriate content?");
        if (confirmReport && onReport) {
            onReport(data.id);
            alert("Thank you. The report has been sent to moderation.");
        }
    };


    return (
      <div className={styles.newsCard}>
            <div className={styles.top}>
                <div className={styles.about}>
                    <div className={styles.text}>
                        <div className={styles.subTitle}>
                            {data.user?.name || "Anonymous Guest"}
                            {(data.status === "is_active" || data.status === "active") && (
                                <div className={styles.statusWrapper}>
                                    <span className={styles.statusDot} title="Online"/>
                                    <span className={styles.statusPulse}/>
                                </div>
                            )}
                        </div>
                        <div className={styles.contentWrapper}>
                            <p className={styles.contentText}>
                                {data.text || data.description || "No comment provided."}
                            </p>
                        </div>
                    </div>

                    <div className={styles.buttonGroup}>
                        {!showReportForm ? (
                            <>
                                <button onClick={handleLike}
                                        className={`${styles.editButton} ${isLiked ? styles.activeLike : ''}`}>
                                    👍 {likesCount}
                                </button>
                                <button onClick={() => setShowReportForm(true)} className={styles.deleteButton}>
                                    ⚠ Report
                                </button>
                            </>
                        ) : (
                            <div className={styles.selectWrapper}>
                                <div className={styles.reason}>
                                    <label className={styles.labelSelect}>Reason</label>
                                    <select
                                        value={reportReason}
                                        onChange={(e) => setReportReason(e.target.value)}
                                        className={styles.select}
                                    >
                                        <option value="спам">Spam</option>
                                        <option value="фейк">Fake</option>
                                        <option value="образи">Abuse</option>
                                        <option value="інше">Other</option>
                                    </select>
                                    <div className={styles.reportActionButtons}>
                                        <button onClick={() => {
                                            onReport(data.id, {reason: reportReason, comment: reportComment});
                                            setShowReportForm(false);
                                            setIsReported(true);
                                            setReportComment("");
                                            setTimeout(() => setIsReported(false), 3000);
                                        }} className={styles.sendReportBtn}>Send
                                        </button>

                                        <button onClick={() => setShowReportForm(false)}
                                                className={styles.cancelReportBtn}>✕
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.send} >
                                    <label className={styles.labelSelect}>Add more details (optional)...</label>
                                    <textarea
                                    className={styles.reportTextarea}
                                    value={reportComment}
                                    onChange={(e) => setReportComment(e.target.value)}
                                />
                                </div>
                            </div>
                        )}
                    </div>
                    {isReported && <div className={styles.bottomAlert}>✅ Report sent</div>}
                </div>

                {images.length > 0 && (
                    <div className={styles.galleryWrapper}>
                        <NewsGalleryComponent images={images}/>
                    </div>
                )}

                <div className={styles.topStatus}>
                    <div className={styles.overallHeader}>
                        <span className={styles.overallLabel}>{Number(data.rating || 0).toFixed(1)} ✸</span>
                    </div>

                    <div className={styles.subRatings}>
                        {['Food', 'Service', 'Atmosphere', 'Cleanliness', 'Value'].map((item) => (
                            <div key={item} className={styles.subRatingItem}>
                                <span className={styles.ratingLabel}>{item}</span>
                                <ReviewStarsComponent rating={s[item.toLowerCase().split(' ')[0]] || 0}/>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};