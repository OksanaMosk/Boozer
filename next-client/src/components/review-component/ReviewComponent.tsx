"use client"

import styles from "./ReviewComponent.module.css";
import { ReviewStarsComponent } from "@/components/review-stars-component/ReviewStarsComponent";
import {NewsGalleryComponent} from "@/components/news-gallery-compopnent/NewsGalleryComponent";
import React, {useState} from "react";

export const ReviewComponent = ({review, onLike, onReport, isAdminView = false}: any) => {
    const data= review;
    const [likesCount, setLikesCount] = useState(data?.likes_count || 0);
    const [isLiked, setIsLiked] = useState(data?.is_liked || false);
    const [showReportForm, setShowReportForm] = useState(false);
    const [reportReason, setReportReason] = useState("Spam");
    const [reportComment, setReportComment] = useState("");
    const [isReported, setIsReported] = useState(false);
    if (!data) return null;

    const images = (data.review_photos || []).map((p: any) => ({
        image: p.photo
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

    const handleSendReport = () => {
        if (onReport) {
            onReport(data.id, {
                reason: reportReason,
                comment: reportComment
            });
            setShowReportForm(false);
            setIsReported(true);
            setReportComment("");
            setTimeout(() => setIsReported(false), 3000);
        }
    };

    return (
      <div className={styles.newsCard}>
            <div className={styles.top}>
                <div className={styles.about}>
                    <div className={styles.text}>
                        <div className={styles.subTitle}>
                            {data.author_name || "Anonymous Guest"}
                            {(data.status === "is_active" || data.status === "active") && (
                                <div className={styles.statusWrapper}>
                                    <span className={styles.statusDot} title="Online"/>
                                    <span className={styles.statusPulse}/>
                                </div>
                            )}

                        </div>
                        <p className={styles.date}>
                                Created
                                at: {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                        <div className={styles.contentWrapper}>
                            <p className={styles.contentText}>
                                {data.comment || "No comment provided."}
                            </p>
                        </div>
                        {data.owner_reply && (
                            <div className={styles.ownerReply}>
                                <strong>Owner's reply:</strong>
                                <p>{data.owner_reply}</p>
                            </div>
                        )}
                    </div>
                    {!isAdminView && (
                        <>
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
                                        {isReported && <div className={styles.bottomAlert}>Report sent</div>}
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
                                                <option value="Spam">Spam</option>
                                                <option value="Fake">Fake</option>
                                                <option value="Abuse">Abuse</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            <div className={styles.reportActionButtons}>
                                                <button onClick={handleSendReport}
                                                        className={styles.sendReportBtn}>Send
                                                </button>

                                                <button onClick={() => setShowReportForm(false)}
                                                        className={styles.cancelReportBtn}>✕
                                                </button>
                                            </div>
                                        </div>

                                        <div className={styles.send}>
                                            <label className={styles.labelSelect}>Add more details (optional)...</label>
                                            <textarea
                                                placeholder="Tell us more..."
                                                className={styles.reportTextarea}
                                                value={reportComment}
                                                onChange={(e) => setReportComment(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {isAdminView && review.report_details && (
                        <div className={styles.adminReportSection}>
                            {!Array.isArray(review.report_details) && review.report_details.has_reports && (
                                <div className={styles.contentReport}>
                                    <strong>⚠️ Attention:</strong> This review has been reported for:
                                    <p className={styles.reportDetails}>
                                        {review.report_details.reasons.join(", ")}
                                    </p>
                                </div>
                            )}

                            {Array.isArray(review.report_details) && (
                                <div className={styles.detailsAdminList}>
                                    <h4 className={styles.detailsAdminTitle}>Global Moderation
                                        Details:</h4>
                                    <ol className={styles.detailsAdminWrapper}>
                                        {review.report_details.map((report: any, idx: number) => (
                                        <li className={styles.detailsAdminAbout}
                                             key={idx}
                                        >
                                            <p className={styles.detailsAbout}><strong>Reason:</strong> {report.reason}
                                            </p>
                                            <p className={styles.detailsAbout}>
                                                <strong>Comment:</strong> {report.comment || "No text"}</p>
                                            <p className={styles.detailReporter}>By: {report.reporter}</p>
                                        </li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {images.length > 0 && (
                    <div className={styles.galleryWrapper}>
                        <NewsGalleryComponent images={images}/>
                    </div>
                )}

                <div className={styles.topStatus}>
                    <div className={styles.overallHeader}>
                        <div className={styles.starBlockTitle}>
                            <span className={styles.overallLabel}>{Number(data.rating || 0).toFixed(1)} ✸</span>
                            <p className={styles.id}>Venue Id: {data.venue}</p>
                        </div>
                    </div>

                    <div className={styles.subRatings}>
                        {[
                            {label: 'Food', key: 'food_rating'},
                            {label: 'Service', key: 'service_rating'},
                            {label: 'Atmosphere', key: 'atmosphere_rating'},
                            {label: 'Cleanliness', key: 'cleanliness_rating'},
                            {label: 'Value', key: 'value_rating'}
                        ].map((item) => (
                            <div key={item.key} className={styles.subRatingItem}>
                                    <span className={styles.ratingLabel}>{item.label}</span>
                                <ReviewStarsComponent rating={data[item.key] || 0}/>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
      </div>
    );
};