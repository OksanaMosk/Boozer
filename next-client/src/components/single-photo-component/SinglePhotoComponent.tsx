"use client";
import React, {useState, ChangeEvent, SyntheticEvent} from "react";
import styles from "./SinglePhotoComponent.module.css";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";

interface SinglePhotoProps {
    initialPhotoUrl?: string;
    onUpload: (file: File) => Promise<string>;
    onChange?: (uploadedUrl: string) => void;
    label?: string;
}

export const SinglePhotoComponent = ({
                                         initialPhotoUrl,
                                         onUpload,
                                         onChange,
                                         label = "Upload Photo",
                                     }: SinglePhotoProps) => {
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
        <div className={styles.photoUploadWrapper}>
            {label && <p className={styles.label}>{label}</p>}
            <div>
                {preview ? <img src={preview} alt="Uploaded" width={140} height={100}  className={styles.photoPreview}/> : <p>No photo</p>}
            </div>
            <input type="file" onChange={handleFileChange} className={styles.inputFile}/>
            <button
                type="button"
                disabled={loading || !file}
                className={styles.button}
                onClick={handleUpload}
            >
                {loading ? <div className={`authButton ${styles.loaderWrapper}`}><LoaderComponent/> </div>: "Upload"}
            </button>

            {message && <p className={styles.errorMessage}>{message}</p>}
        </div>
    )
};