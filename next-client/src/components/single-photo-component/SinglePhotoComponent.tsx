"use client";

import React, { useState, ChangeEvent, SyntheticEvent } from "react";
import styles from "./SinglePhotoUploadComponent.module.css";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";

interface SinglePhotoProps<T = any> {
    initialPhotoUrl?: string;
    onUpload: (file: File) => Promise<string>;
    onChange?: (uploadedUrl: string) => void;
    label?: string;
}

export const SinglePhotoComponent = <T,>({
    initialPhotoUrl,
    onUpload,
    onChange,
    label = "Upload Photo",
}: SinglePhotoProps<T>) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(initialPhotoUrl || null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setMessage(null);

        try {
            const uploadedUrl = await onUpload(file);
            setPreview(uploadedUrl);
            setFile(null);
            if (onChange) onChange(uploadedUrl);
        } catch (err) {
            console.error(err);
            setMessage("Failed to upload photo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleUpload} className={styles.photoUploadWrapper}>
            {label && <label className={styles.label}>{label}</label>}

            <div className={styles.photoPreview}>
                {preview ? (
                    <img src={preview} alt="Uploaded" width={140} height={100} />
                ) : (
                    <p>No photo</p>
                )}
            </div>

            <input type="file" onChange={handleFileChange} className={styles.inputFile} />

            <button type="submit" disabled={loading || !file} className={styles.uploadButton}>
                {loading ? <LoaderComponent /> : "Upload"}
            </button>

            {message && <p className={styles.errorMessage}>{message}</p>}
        </form>
    );
};