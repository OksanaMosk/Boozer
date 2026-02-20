import React from "react";
import styles from "./VenuePhotosComponent.module.css";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";


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
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const files = Array.from(e.target.files).map((file, i) => ({
            file,
            preview_url: URL.createObjectURL(file),
            is_main: newFiles.length === 0 && i === 0,
        }));

        setNewFiles((prev) => [...prev, ...files]);
    };

    return (
        <form onSubmit={onAddPhotos} className={styles.photoWrapper}>
            <label className={styles.label}>Upload Photos (Max 7)</label>

            <input
                type="file"
                multiple
                disabled={loading}
                className={styles.inputFile}
                onChange={handlePhotoChange}
            />

            <div className={styles.photoContainer}>
                {existingPhotos.map((p) => (
                    <div className={styles.photoArray} key={p.id}>
                        <img
                            src={p.photo}
                            alt=""
                            width={140}
                            height={100}
                            className={styles.photoImage}
                        />

                        <button
                            type="button"
                            onClick={() => onDeleteExisting?.(p.id)}
                            className={styles.deleteButton}
                        >
                            Delete
                        </button>
                    </div>
                ))}

                {newFiles.map((file, i) => (
                    <div className={styles.photoArray} key={i}>
                        <img
                            src={file.preview_url}
                            alt=""
                            width={140}
                            height={100}
                            className={styles.photoImage}
                        />
                        <label>
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
                            onClick={() =>
                                setNewFiles((prev) =>
                                    prev.filter((_, idx) => idx !== i)
                                )
                            }
                            className={styles.deleteButton}
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
                        <div className={`authButton ${styles.loaderWrapper}`}>
                            <LoaderComponent />
                        </div>
                    ) : (
                        "Add Photos"
                    )}
                </button>
            )}
        </form>
    );
};
