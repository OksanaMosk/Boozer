
"use client";

import {useEffect, useState} from "react";
import { ReviewStarsComponent } from "@/components/review-stars-component/ReviewStarsComponent";
import PhotoMultipleUploadComponent from "@/components/photo-multiple-upload-component/PhotoMultipleUploadComponent";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import styles from "./ReviewFormComponent.module.css";

export const ReviewFormComponent = ({ venueId, onSubmit, orders, onUploadComplete  }: any) => {
    const [subRatings, setSubRatings] = useState({
        food: 0,
        service: 0,
        atmosphere: 0,
        cleanliness: 0,
        value: 0
    });
    const [selectedOrderId, setSelectedOrderId] = useState<string>("");
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [localMessage, setLocalMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [createdReview, setCreatedReview] = useState<any>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const overallRating = Object.values(subRatings).reduce((a, b) => a + b, 0) / 5;

    const handleStarClick = (category: string, value: number) => {
        setSubRatings(prev => ({ ...prev, [category]: value }));
    };

    useEffect(() => {
        if (localMessage) {
            const timer = setTimeout(() => setLocalMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [localMessage]);

    useEffect(() => {
        const firstAvailable = orders?.find((o: any) =>
            (o.venue?.id || o.venue).toString() === venueId.toString() && o.status === "CONFIRMED"
        );
        if (firstAvailable && !selectedOrderId) {
            setSelectedOrderId(firstAvailable.id.toString());
        }
    }, [orders, venueId]);

    const handleUploadComplete = () => {
        setShowSuccess(true);
        setCreatedReview(null);
        setText("");
        setSelectedOrderId("");
        setSubRatings({ food: 0, service: 0, atmosphere: 0, cleanliness: 0, value: 0 });
        if (onUploadComplete) {
        onUploadComplete();
    }
        setTimeout(() => setShowSuccess(false), 5000);
    };

        const handleAddReview = async () => {
    setLoading(true);
    try {
        const res = await onSubmit({
            // rating: overallRating,
            comment: text,
            order: selectedOrderId,
            food_rating: subRatings.food,
            service_rating: subRatings.service,
            atmosphere_rating: subRatings.atmosphere,
            cleanliness_rating: subRatings.cleanliness,
            value_rating: subRatings.value
        });
        const data = res?.data || res;
        if (data && data.id) {
            setCreatedReview(data);
            setLocalMessage({ text: "Review saved! Add photos below.", type: 'success' });
        }
    } catch (err: any) {
        setLocalMessage({ text: "Error saving review", type: 'error' });
    } finally {
        setLoading(false);
    }
};
    const RatingRow = ({ label, category, value }: any) => (
        <div className={styles.starsRating}>
            <span className={styles.starsLabel}>{label}</span>
            <ReviewStarsComponent
                rating={value}
                interactive={!createdReview}
                onStarClick={(val: number) => handleStarClick(category, val)}
            />
        </div>
    );

    const hasOrder = orders?.some(
        (o: any) => (o.venue?.id || o.venue).toString() === venueId.toString() && o.status === "CONFIRMED"
    );

    if (!hasOrder && !createdReview) {
        return <p className={styles.noOrderMsg}>Submit a review after your confirmed visit.</p>;
    }

    return (
        <div className={styles.wrapper}>
            {showSuccess && (
                <div className={styles.successMessage}>
                    Thank you! Your review and photos have been successfully published.
                </div>
            )}

            <h3 className={styles.title}>Average Rating: {overallRating.toFixed(1)} ✸</h3>

            <div className={styles.subRatings}>
                <RatingRow label="Food" category="food" value={subRatings.food} />
                <RatingRow label="Service" category="service" value={subRatings.service} />
                <RatingRow label="Atmosphere" category="atmosphere" value={subRatings.atmosphere} />
                <RatingRow label="Cleanliness" category="cleanliness" value={subRatings.cleanliness} />
                <RatingRow label="Value" category="value" value={subRatings.value} />
            </div>

            <div className={styles.selectWrapper}>
                <label className={styles.label}>Select your visit:</label>
                <select
                    className={styles.select}
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    disabled={!!createdReview}
                >
                    <option value="">Choose an order</option>
                    {orders?.map((o: any) => (
                        <option key={o.id} value={o.id}>
                            Order №{o.id}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.section}>
                <textarea
                    className={styles.textarea}
                    placeholder="Share your experience..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={!!createdReview}
                />

                {createdReview && (
                    <div style={{ marginTop: "20px" }}>
                        <PhotoMultipleUploadComponent
                            venueId={venueId}
                            newsId={createdReview.id.toString()}
                            type="reviews"
                            maxFiles={7}
                            existingPhotos={[]}
                            onUploadComplete={handleUploadComplete}
                        />
                    </div>
                )}

                {localMessage && (
                    <div className={styles.localMessage}>{localMessage.text}</div>
                )}

                <button
                    onClick={handleAddReview}
                    disabled={loading || !!createdReview}
                    className={`${styles.saveBtn} ${(loading || !!createdReview) ? styles.buttonDisabled : ''}`}
                >
                    {loading ? (
                        <div className={styles.loaderWrapper}><LoaderComponent /></div>
                    ) : (
                        createdReview ? "Review Created! Add Photos Above" : "Submit Review"
                    )}
                </button>
            </div>
        </div>
    );
};

