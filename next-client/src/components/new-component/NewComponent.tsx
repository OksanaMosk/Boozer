"use client";

import React, { useState } from "react";
import { useUser } from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import { NewsGalleryComponent } from "@/components/news-gallery-compopnent/NewsGalleryComponent";
import PhotoMultipleUploadComponent from "@/components/photo-multiple-upload-component/PhotoMultipleUploadComponent";
import styles from "./NewComponent.module.css";

interface VenueNewComponentProps {
    news: any;
    venueId: string;
    token: string;
    onDelete: (id: string | number) => void;
    onUpdate: (updatedNews: any) => void;
    isReadOnly?: boolean;
}

export const NewComponent = ({news, venueId, onDelete, onUpdate, isReadOnly = false}: VenueNewComponentProps) => {
    const {user} = useUser();
    const [editMode, setEditMode] = useState(false);
    const [editNews, setEditNews] = useState(news);
    const [loading, setLoading] = useState(false);
    const images = editNews.images || [];
    const [coverMessage, setCoverMessage] = useState("");
    const coverImage = images.find((img: any) => img.is_cover)?.image || editNews.preview;
    const isAdmin = user?.role === 'admin';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value, type} = e.target;
        const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        setEditNews({...editNews, [name]: val});
    };

    const handleSetCover = async (photoId: string | number) => {
        if (!user?.token || !editNews?.id) return;
        const photo = editNews.images?.find((p: any) => p.id.toString() === photoId.toString());
        const isLocal = !photo || photo.id.toString().includes('blob');


        if (isLocal) {
            setCoverMessage("Upload photos please!");
            setTimeout(() => setCoverMessage(""), 3000);
            return;
        }


        try {
            const res = await venueServices.venues
                .news({accessToken: user.token})(venueId)
                .images(editNews.id.toString())
                .update(photoId.toString(), {is_cover: true});
            if (res.data && res.data.id) {
                const serverPhotoId = res.data.id.toString();
                const updatedImages = editNews.images.map((img: any) => ({
                    ...img,
                    is_cover: img.id.toString() === serverPhotoId
                }));
                const updatedNews = {...editNews, images: updatedImages};
                setEditNews(updatedNews);
                onUpdate(updatedNews);
                setCoverMessage("");
            }
        } catch (err:any) {
            const errorText = err.response?.data?.detail || "Failed to set cover image";
            setCoverMessage(errorText);
            setTimeout(() => setCoverMessage(""), 3000);
        }
    };
    const handleSave = async () => {
        if (!user?.token) return;
        setLoading(true);
        setCoverMessage("");
        try {
            const formData = new FormData();
            formData.append("title", editNews.title);
            formData.append("content", editNews.content);
            formData.append("is_pinned", editNews.is_pinned ? "true" : "false");
            if (isAdmin && editNews.status) {
                formData.append("status", editNews.status);
            }
            const res = await venueServices.venues.news({accessToken: user.token})(venueId)
                .update(editNews.id.toString(), formData as any);
            setEditNews({...editNews, ...res.data});
            onUpdate(res.data);
            setEditMode(false);
        } catch (err: any) {
            setCoverMessage(err.response?.data?.detail || "Error saving changes");
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className={`${styles.newsCard} ${editMode ? styles.editMode : ''}`}>
            <div className={styles.top}>
                {editMode ? (
                    <div className={styles.topPin}>
                        <input
                        type="text"
                        name="title"
                        value={editNews.title}
                        onChange={handleChange}
                        className={styles.subTitleEdit}
                    />
                        <label className={styles.pin}>
                            <input
                                type="checkbox"
                                name="is_pinned"
                                checked={editNews.is_pinned}
                                onChange={handleChange}
                            />
                            Pin
                        </label>
                    </div>
                ) : (
                    <div className={styles.subTitlePin}>
                        {editNews.is_pinned && <span title="Pinned" className={styles.pinned}>🎊</span>}
                        {editNews.title}
                    </div>
                )}
                {!isReadOnly && (
                    <div className={styles.topStatus}>
                        <p className={styles.topP}><strong>Type:</strong> {editNews.type}</p>
                        {editMode && isAdmin ? (
                            <div className={styles.statusSelectWrapper}>
                                <strong>Status:</strong>
                                <select
                                    name="status"
                                    value={editNews.status}
                                    onChange={(e) => setEditNews({...editNews, status: e.target.value})}
                                    className={styles.statusSelect}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="active">Active</option>
                                </select>
                            </div>
                        ) : (
                            <p className={styles.topP}><strong>Status:</strong> {editNews.status}</p>
                        )}
                    </div>
                )}
                {!isReadOnly && (
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
                    )}
                <p className={styles.id}>Venue Id: {venueId} </p>
            </div>

            <div className={styles.bottomWrapper}>
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
                    {coverImage && <img src={coverImage} alt="Cover" className={styles.coverImage}/>}
                </div>

                <div className={styles.bottom}>


                    {!isReadOnly && editMode && (
                        <div className={styles.photoWrapper}>
                            {coverMessage && <div className={styles.error}>{coverMessage}</div>}
                            <PhotoMultipleUploadComponent
                                key={editNews.id}
                                venueId={venueId}
                                newsId={editNews.id.toString()}
                                existingPhotos={editNews.images
                                    ?.filter((img: any) => img.image || img.preview)
                                    .map((img: any) => ({

                                        id: img.id,
                                        url: img.image || img.preview || null,
                                        is_cover: img.is_cover || false
                                    })) || []}
                                maxFiles={7}
                                onSetCover={handleSetCover}
                                onUploadComplete={(uploadedPhotos: any[]) => {
                                    const newImages = uploadedPhotos.map((p) => ({
                                        id: p.id,
                                        image: p.image || p.url,
                                        is_cover: p.is_cover || false
                                    }));

                                    const updatedNews = {
                                        ...editNews,
                                        images: [...(editNews.images || []), ...newImages]
                                    };

                                    setEditNews(updatedNews);
                                    onUpdate(updatedNews);
                                }}
                            />
                        </div>
                    )}
                    {images.length > 0 && <NewsGalleryComponent images={images}/>}
                </div>

            </div>
        </div>
    );
};
