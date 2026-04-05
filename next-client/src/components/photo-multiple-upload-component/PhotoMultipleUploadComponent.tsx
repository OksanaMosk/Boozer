"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { useUser } from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import styles from "./PhotoMultipleUploadComponent.module.css";

interface Photo {
    id?: string;
    preview_url: string;
    is_cover: boolean;
    file?: File;
}

interface MultiplePhotoUploadProps {
    venueId: string;
    newsId: string;
    type?: "news" | "reviews";
    onUploadComplete: (photos: string[]) => void;
    existingPhotos?: { id: string; url?: string; image?: string; is_cover: boolean }[];
    maxFiles: number;
    onSetCover?: (photoId: string | number) => void;
}

const PhotoMultipleUploadComponent: React.FC<MultiplePhotoUploadProps> = ({
                                                                              venueId,
                                                                              newsId,
                                                                              type = "news",
                                                                              onUploadComplete,
                                                                              existingPhotos = [],
                                                                              maxFiles,
                                                                              onSetCover,
                                                                          }) => {
    const {user} = useUser();
    const [loading, setLoading] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [photos, setPhotos] = useState<Photo[]>(
        existingPhotos.map((photo): Photo => ({
            id: photo.id,
            preview_url: photo.url || photo.image || "",
            is_cover: photo.is_cover || false,
        }))
    );

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        if (photos.length + files.length > maxFiles) {
            alert(`You can upload a maximum of ${maxFiles} files. Currently you have ${photos.length}.`);
            return;
        }
        const previewPhotos: Photo[] = files.map((file, i) => ({
            file: file,
            preview_url: URL.createObjectURL(file),
            is_cover: photos.length === 0 && i === 0,
        }));
        setPhotos(prev => [...prev, ...previewPhotos]);
    };
    const handleDelete = async (index: number) => {
        const photoToDelete = photos[index];
        if (photoToDelete.file) {
            URL.revokeObjectURL(photoToDelete.preview_url);
            setPhotos(prev => prev.filter((_, i) => i !== index));
            return;
        }
        if (photoToDelete.id) {
            setLoading(true);
            try {
                if (!user?.token) return;
                // await venueServices
                //     .venues
                //     .news({accessToken: user.token})(venueId)

                await (venueServices.venues as any)
                    [type]({accessToken: user.token})(venueId)
                    .images(newsId)
                    .delete(photoToDelete.id);
                setPhotos(prev => prev.filter((_, i) => i !== index));
            } catch (error: any) {
                if (error.response?.status === 404) {
                    setPhotos(prev => prev.filter((_, i) => i !== index));
                } else {
                    console.error("Error deleting from server", error);
                }
            } finally {
                setLoading(false);
            }
        }
    };

    const handleUpload = async () => {
        if (!user?.token) return;
        const filesToUpload = photos.filter(p => p.file);
        if (filesToUpload.length === 0) return;
        setLoading(true);
        try {
            const uploadedUrls: string[] = [];
            for (const photo of photos) {
                if (photo.file) {
                    const formData = new FormData();
                    // formData.append("image", photo.file);
                    const fieldName = type === "reviews" ? "photo" : "image";
                    formData.append(fieldName, photo.file);
                    // formData.append("is_cover", photo.is_cover ? "true" : "false");

                    if (type === "news") {
                        formData.append("is_cover", photo.is_cover ? "true" : "false");
                    }

                    // const res = await venueServices
                    //     .venues
                    //     .news({accessToken: user.token})(venueId)

                    const res = await (venueServices.venues as any)
                        [type]({accessToken: user.token})(venueId)
                        .images(newsId)
                        .create(formData);
                    // uploadedUrls.push(res.data.image);
                    uploadedUrls.push(res.data.photo || res.data.image);
                }
            }
            onUploadComplete(uploadedUrls);
            setPhotos(prev => prev.map(p => ({...p, file: undefined})));
            alert("Upload successful!");
        } catch (error) {
            console.error("Error uploading photos", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCoverChange = (index: number) => {
        const selectedPhoto = photos[index];
        if (selectedPhoto.id && onSetCover) {
            onSetCover(selectedPhoto.id);
        }
        setPhotos(prev => prev.map((p, i) => ({
            ...p,
            is_cover: i === index
        })));
    };

    const openFileDialog = () => {
        inputRef.current?.click();
    };
    return (
        <div className={styles.wrapper}>
            <div>
                <div className={styles.uploadWrapper}>
                    <button
                        type="button"
                        onClick={openFileDialog}
                        className={styles.inputPhoto}
                    >
                        Upload Photos (Max 7)
                    </button>
                    <input
                        ref={inputRef}
                        id="fileUpload"
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={loading || photos.length >= maxFiles}
                        style={{display: "none"}}
                        onChange={handleFileChange}
                    />
                </div>
                <span className={styles.photoSpan}>
                    {photos.filter(p => p.file).length > 0
                        ? `${photos.filter(p => p.file).length} new files selected (not saved yet)`
                        : "No new files chosen"}
            </span>
            </div>

            <div className={styles.photoContainer}>
                {photos.map((photo, index) => (
                    <div key={index} className={styles.photoArray}>
                        <img
                            src={photo.preview_url}
                            alt="Preview"
                            className={styles.photoImage}
                        />
                        <div className={styles.actions}>
                            {/*<label className={styles.checkLabel}>*/}
                            {/*    <input*/}
                            {/*        type="radio"*/}
                            {/*        name="coverPhoto"*/}
                            {/*        checked={photo.is_cover}*/}
                            {/*        onChange={() => handleCoverChange(index)}*/}

                            {/*    />*/}
                            {/*    Cover*/}
                            {/*</label>*/}
                            {type === "news" && (
                                <label className={styles.checkLabel}>
                                    <input
                                        type="radio"
                                        name="coverPhoto"
                                        checked={photo.is_cover}
                                        onChange={() => handleCoverChange(index)}
                                    />
                                    Cover
                                </label>
                            )}
                            <button
                                type="button"
                                className={styles.deleteButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    void handleDelete(index)
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={handleUpload}
                disabled={loading || !photos.some(p => p.file)}
                className={styles.submitButton}
            >
                {loading ? (
                    <div className={`authButton ${styles.loaderWrapper}`}><LoaderComponent/></div>) : "Save Photos"}
            </button>
        </div>
    );
};

export default PhotoMultipleUploadComponent;

