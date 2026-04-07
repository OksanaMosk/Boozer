"use client";

import React, { useState } from "react";
import styles from "./ReviewEditComponent.module.css";
import { useUser } from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import { ReviewStarsComponent } from "@/components/review-stars-component/ReviewStarsComponent";
import { NewsGalleryComponent } from "@/components/news-gallery-compopnent/NewsGalleryComponent";
import PhotoMultipleUploadComponent from "@/components/photo-multiple-upload-component/PhotoMultipleUploadComponent";

interface ReviewEditComponentProps {
    review: any;
    onDelete?: (id: string | number) => void;
    onUpdate?: (updatedReview: any) => void;
}

export const ReviewEditComponent = ({
    review,
    onDelete,
    onUpdate
}: ReviewEditComponentProps) => {
    const { user } = useUser();
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState(review);
    const [loading, setLoading] = useState(false);

    const calculateOverall = (data: any) => {
        const sum =
            Number(data.food_rating || 0) +
            Number(data.service_rating || 0) +
            Number(data.atmosphere_rating || 0) +
            Number(data.cleanliness_rating || 0) +
            Number(data.value_rating || 0);
        return (sum / 5).toFixed(1);
    };

    const handleStarClick = (category: string, value: number) => {
        setEditData((prev: any) => ({ ...prev, [`${category}_rating`]: value }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!user?.token) return;
        setLoading(true);
        try {
            const overall = calculateOverall(editData);
            const payload = {
                comment: editData.comment,
                rating: overall,
                food_rating: editData.food_rating,
                service_rating: editData.service_rating,
                atmosphere_rating: editData.atmosphere_rating,
                cleanliness_rating: editData.cleanliness_rating,
                value_rating: editData.value_rating,
            };

            const res = await venueServices.reviews.update(
                editData.id.toString(),
                payload as any,
                { accessToken: user.token }
            );

            const updated = (res as any).data || res;
            setEditData(updated);
            if (onUpdate) onUpdate(updated);
            setEditMode(false);
        } catch (error) {
            console.error("Save failed", error);
        } finally {
            setLoading(false);
        }
    };


    const imagesForGallery = (editData.review_photos || []).map((p: any) => ({
        image: p.photo
    }));


    return (
        <div className={`${styles.newsCard} ${editMode ? styles.editMode : ""}`}>
            <div className={styles.top}>
                <div className={styles.about}>
                        <div className={styles.subTitle}>
                            <p>{editData.author_name }</p>
                            <div className={styles.contentWrapper}>
                            {editMode ? (
                                <textarea
                                    name="comment"
                                    value={editData.comment}
                                    onChange={handleChange}
                                    className={styles.reportTextarea}
                                />
                            ) : (
                                <p className={styles.contentText}>
                                    {editData.comment || "No comment provided."}
                                </p>
                            )}
                        </div>
                             <div className={styles.buttonGroup}>
                                 {editMode ? (
                                     <>
                                         <button onClick={handleSave} disabled={loading} className={styles.editButton}>
                                             {loading ? "Saving..." : "Save All"}
                                         </button>
                                         <button onClick={() => setEditMode(false)} className={styles.deleteButton}>
                                             Cancel
                                         </button>
                                     </>
                                 ) : (
                                     <>
                                         <button onClick={() => setEditMode(true)} className={styles.editButton}>
                                             Edit
                                         </button>
                                         {onDelete && (
                                             <button onClick={() => onDelete(editData.id)}
                                                     className={styles.deleteButton}>
                                                 Delete
                                             </button>
                                         )}
                                     </>
                                 )}
                             </div>
                        </div>
                    <div>
                        <p style={{marginLeft: '10px', color: '#ffc107'}}>
                        ★ {calculateOverall(editData)}
                    </p>
                        <div className={styles.bottom}>
                            {editMode ? (
                                <div style={{marginTop: "15px"}}>
                                    <PhotoMultipleUploadComponent
                                        venueId={editData.venue?.toString() || "0"}
                                        newsId={editData.id.toString()}
                                        type="reviews"
                                        maxFiles={7}
                                        existingPhotos={(editData.review_photos || []).map((p: any) => ({
                                            id: p.id,
                                            url: p.photo
                                        }))}
                                        onUploadComplete={(newPhotos: any) => {
                                            setEditData({...editData, review_photos: newPhotos});
                                        }}
                                    />
                                </div>
                            ) : (
                                imagesForGallery.length > 0 && (
                                    <div style={{marginTop: "10px"}}>
                                        <NewsGalleryComponent images={imagesForGallery}/>
                                    </div>
                                )
                            )}
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

                                <ReviewStarsComponent
                                    rating={Number(editData[item.key]) || 0}
                                    interactive={editMode}
                                    onStarClick={(val: number) => handleStarClick(item.key, val)}
                                />
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};
