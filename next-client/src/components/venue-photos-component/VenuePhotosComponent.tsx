"use client";

import React, {useState} from "react";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import styles from "./VenuePhotosComponent.module.css";

interface ILocalPhoto {
    file: File;
    preview_url: string;
    is_main?: boolean;
}

interface IVenuePhoto {
    id: string;
    photo: string;
}

interface VenuePhotosProps {
    existingPhotos?: IVenuePhoto[];
    newFiles: ILocalPhoto[];
    setNewFiles: React.Dispatch<React.SetStateAction<ILocalPhoto[]>>;
    onAddPhotos: (e: React.SyntheticEvent) => void;
    onDeleteExisting?: (id: string) => void;
    loading: boolean;
}

export const VenuePhotosComponent = ({
                                         existingPhotos = [],
                                         newFiles,
                                         setNewFiles,
                                         onAddPhotos,
                                         onDeleteExisting,
                                         loading,
                                     }: VenuePhotosProps) => {
    const [message, setMessage] = useState("");

    const showMessage = (text: string) => {
        setMessage(text);
        setTimeout(() => setMessage(""), 5000);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selectedFiles = Array.from(e.target.files);
        const MAX_LIMIT = 7;
        const currentTotal = existingPhotos.length + newFiles.length;
        if (currentTotal + selectedFiles.length > MAX_LIMIT) {
             showMessage(`Limit reached: ${MAX_LIMIT} photos max. You have ${currentTotal}.`);
            e.target.value = "";
            return;
        }
         setMessage("");
        const mappedFiles = selectedFiles.map((file, i) => ({
            file,
            preview_url: URL.createObjectURL(file),
            is_main: currentTotal === 0 && i === 0,
        }));

        setNewFiles((prev) => [...prev, ...mappedFiles]);
        e.target.value = "";
    };

    const removeNewFile = (index: number) => {
        setNewFiles((prev) => {
            const fileToRemove = prev[index];
            if (fileToRemove) {
                URL.revokeObjectURL(fileToRemove.preview_url);
            }
            return prev.filter((_, idx) => idx !== index);
        });
    };

    return (
        <form onSubmit={onAddPhotos} className={styles.photoWrapper}>
              {message && <p className={styles.errorMessage}>{message}</p>}
            <label className={styles.label}>
                Upload Photos (Total: {existingPhotos.length + newFiles.length} / 7)
            </label>

            <input
                type="file"
                multiple
                accept="image/*"
                disabled={loading || (existingPhotos.length + newFiles.length >= 7)}
                className={styles.inputFile}
                onChange={handlePhotoChange}
            />

            <div className={styles.photoContainer}>
                {existingPhotos.map((p) => (
                    <div className={styles.photoArray} key={p.id}>
                        <img
                            src={p.photo}
                            alt="Existing"
                            className={styles.photoImage}
                        />
                        <button
                            type="button"
                            onClick={() => onDeleteExisting?.(p.id)}
                            className={styles.deleteButton}
                            disabled={loading}
                        >
                            Delete
                        </button>
                    </div>
                ))}
                {newFiles.map((file, i) => (
                    <div className={styles.photoArray} key={`new-${i}`}>
                        <img
                            src={file.preview_url}
                            alt="Preview"
                            className={styles.photoImage}
                        />
                        <label className={styles.mainLabel}>
                            <input
                                type="radio"
                                name="mainPhoto"
                                checked={file.is_main || false}
                                onChange={() => {
                                    setNewFiles((prev) =>
                                        prev.map((p, index) => ({...p, is_main: index === i}))
                                    );
                                }}
                            />
                            Main
                        </label>
                        <button
                            type="button"
                            onClick={() => removeNewFile(i)}
                            className={styles.deleteButton}
                            disabled={loading}
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>

            {newFiles.length > 0 && (
                <button
                    type="submit"
                    disabled={loading}
                    className={styles.submitButton}
                >
                    {loading ? (
                        <div className={styles.loaderWrapper}>
                            <LoaderComponent/>
                        </div>
                    ) : (
                        `Add ${newFiles.length} Photo${newFiles.length > 1 ? 's' : ''}`
                    )}
                </button>
            )}
        </form>
    );
};
