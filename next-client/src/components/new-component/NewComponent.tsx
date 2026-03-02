"use client";

import React, { useState } from "react";
import styles from "./NewComponent.module.css";
import { NewsGallery } from "@/components/news-gallery-compopnent/NewsGalleryComponent";
import venueServices from "@/lib/services/venueService";
import { useUser } from "@/app/contexts/UserProvider";
import PhotoMultipleUploadComponent from "@/components/photo-multiple-upload-component/PhotoMultipleUploadComponent";
import {INews} from "@/models/IVenue";

interface VenueNewComponentProps {
    news: any;
    venueId: string;
    token: string;
    onDelete: (id: string | number) => void;
    onUpdate: (updatedNews: any) => void;
}

export const NewComponent = ({ news, venueId, onDelete, onUpdate }: VenueNewComponentProps) => {
    const { user } = useUser();
    const [editMode, setEditMode] = useState(false);
    const [editNews, setEditNews] = useState(news);
    const [loading, setLoading] = useState(false);
    const images = editNews.images || [];
    const coverImage = images.find((img: any) => img.is_cover)?.image || editNews.preview;
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditNews({ ...editNews, [e.target.name]: e.target.value });
    };
    const handleSave = async () => {
        if (!user?.token) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", editNews.title);
            formData.append("content", editNews.content);
            const res = await venueServices.venues.news({ accessToken: user.token })(venueId)
                .update(editNews.id.toString(), formData as any);
            setEditNews({ ...editNews, ...res.data });
            onUpdate(res.data);
            setEditMode(false);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className={`${styles.newsCard} ${editMode ? styles.editMode : ''}`}>
            <div className={styles.top}>
                {editMode ? (
                    <input
                        type="text"
                        name="title"
                        value={editNews.title}
                        onChange={handleChange}
                        className={styles.subTitleEdit}
                    />
                ) : (
                    <div className={styles.subTitle}>{editNews.title}</div>
                )}
                <div className={styles.topStatus}>
                    <p className={styles.topP}><strong>Type:</strong> {editNews.type}</p>
                    <p className={styles.topP}><strong>Status:</strong> {editNews.status}</p>
                </div>
                <div className={styles.buttonGroup}>
                    {editMode ? (
                        <>
                            <button onClick={handleSave} disabled={loading} className={styles.editButton}>
                                {loading ? "Saving..." : "Save"}
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
                            <button onClick={() => onDelete(editNews.id)} className={styles.deleteButton}>
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className={styles.cardInfo}>
                {editMode ? (
                    <textarea
                        name="content"
                        value={editNews.content}
                        onChange={handleChange}
                        className={styles.contentTextEdit}
                    />
                ) : (
                    <p className={styles.contentText}>{editNews.content}</p>
                )}

                <div className={styles.dates}>
                    <p className={styles.date}>
                        <small>Created: {editNews.created_at ? new Date(editNews.created_at).toLocaleDateString() : "---"}</small>
                    </p>
                    {editNews.end_date && (
                        <p className={styles.date}>
                            <small>Ends: {new Date(editNews.end_date).toLocaleDateString()}</small>
                        </p>
                    )}
                </div>
            </div>

            <div className={styles.bottom}>
                {coverImage && <img src={coverImage} alt="Cover" className={styles.coverImage}/>}

                {editMode && (
                    <div className={styles.photoWrapper}>
                        <PhotoMultipleUploadComponent
                            venueId={venueId}
                            newsId={editNews.id.toString()}
                            existingPhotos={editNews.images?.map((img: any)  => ({
                                id: img.id,
                                url: img.image || img.preview || "",
                                is_cover: img.is_cover || false
                            })) || []}
                            maxFiles={7}
                            onUploadComplete={(uploadedUrls) => {
                            setEditNews((prev:INews) => ({
                                ...prev,
                                images: [
                                    ...(prev.images || []),
                                    ...uploadedUrls.map(url => ({image: url, is_cover: false}))
                                ]
                            }));
                        }}
                    /></div>
                )}
                {images.length > 0 && <NewsGallery images={images}/>}
            </div>
        </div>
    );
};
