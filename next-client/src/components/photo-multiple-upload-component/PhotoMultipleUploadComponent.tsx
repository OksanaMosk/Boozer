"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import styles from "./PhotoMultipleUploadComponent.module.css";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import { useUser } from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";

interface Photo {
    preview_url: string;
    is_cover: boolean;
    file?: File;
}

interface MultiplePhotoUploadProps {
    venueId: string;
    newsId: string;
    onUploadComplete: (photos: string[]) => void;
    existingPhotos?: { url?: string, is_cover: boolean }[];
    maxFiles: number;
}

const PhotoMultipleUploadComponent: React.FC<MultiplePhotoUploadProps> = ({
    venueId,
    newsId,
    onUploadComplete,
    existingPhotos = [],
    maxFiles,
}) => {
    const { user } = useUser();
    const [loading, setLoading] = useState<boolean>(false);
    const inputRef = useRef(null);
    const [photos, setPhotos] = useState<Photo[]>(
        existingPhotos.map((photo) => ({
            preview_url: photo.url || "",
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

    const handleDelete = (index: number) => {
        setPhotos(prev => {
            const photoToDelete = prev[index];
            if (photoToDelete.file) {
                URL.revokeObjectURL(photoToDelete.preview_url);
            }
            return prev.filter((_, i) => i !== index);
        });
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
                    formData.append("image", photo.file);
                    formData.append("is_cover", photo.is_cover ? "true" : "false");
                    const res = await venueServices
                        .venues
                        .news({ accessToken: user.token })(venueId)
                        .images(newsId)
                        .create(formData);
                    uploadedUrls.push(res.data.image);
                }
            }

            onUploadComplete(uploadedUrls);
            setPhotos(prev => prev.map(p => ({ ...p, file: undefined })));
            alert("Upload successful!");
        } catch (error) {
            console.error("Error uploading photos", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCoverChange = (index: number) => {
        setPhotos(prev => prev.map((p, i) => ({ ...p, is_cover: i === index })));
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
                        ? `${photos.filter(p => p.file).length} new files selected`
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
                    <label className={styles.checkLabel}>
                                <input
                                    type="radio"
                                    name="coverPhoto"
                                    checked={photo.is_cover}
                                    onChange={() => handleCoverChange(index)}
                                />
                                Cover
                            </label>
                            <button
                                type="button"
                                className={styles.deleteButton}
                                onClick={() => handleDelete(index)}
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
                     <div className={`authButton ${styles.loaderWrapper}`}><LoaderComponent/></div> ) : "Save Photos"}
            </button>
        </div>
    );
};

export default PhotoMultipleUploadComponent;


//
// "use client";
//
// import React, {useState, useRef, ChangeEvent} from "react";
// import styles from "./PhotoMultipleUploadComponent.module.css";
// import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
// import {useUser} from "@/app/contexts/UserProvider";
// import venueServices from "@/lib/services/venueService";
//
// interface Photo {
//     preview_url: string;
//     is_cover: boolean;
// }
//
// interface IncomingPhoto {
//     url?: string;
//     image?: string;
//     is_cover?: boolean
// }
//
// interface MultiplePhotoUploadProps {
//     venueId: string;
//     newsId: string;
//     onUploadComplete: (photos: string[]) => void;
//     existingPhotos?: { url?: string, is_cover: boolean }[];
//
//     maxFiles: number;
// }
//
// const PhotoMultipleUploadComponent: React.FC<MultiplePhotoUploadProps> = ({
//                                                                               venueId,
//                                                                               newsId,
//                                                                               onUploadComplete,
//                                                                               existingPhotos = [],
//                                                                               maxFiles,
//                                                                           }) => {
//     const {user} = useUser();
//     const inputRef = useRef(null);
//     const [newFiles, setNewFiles] = useState<File[]>([]);
//     const [loading, setLoading] = useState<boolean>(false);
//     const [selectedFileName, setSelectedFileName] = React.useState("");
//     const [photos, setPhotos] = useState<Photo[]>(
//         existingPhotos.map((photo: IncomingPhoto) => ({
//             preview_url: photo.url ?? photo.image ?? "",
//             is_cover: photo.is_cover ?? false,
//         }))
//     );
//
//     const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files) return;
//
//     const files = Array.from(e.target.files);
//     // Лог для перевірки стану newFiles перед додаванням нових файлів
//     console.log("Before adding new files:");
//     console.log("newFiles.length", newFiles.length); // Скільки файлів було раніше
//     console.log("files.length", files.length);
//     // Обчислюємо totalFiles без використання старих значень photos та newFiles
//     const totalFiles = files.length + newFiles.length + photos.length; // Враховуємо лише актуальні файли
//     console.log("photos.length", photos.length);
//     console.log("newFiles.length", newFiles.length);
//     console.log("files.length", files.length);
//
//     if (totalFiles > maxFiles) {
//         alert(`You can upload a maximum of ${maxFiles} files.`);
//         return;
//     }
//
//     setSelectedFileName(
//         files.length === 1
//             ? files[0].name
//             : files.map(f => f.name).join(", ")
//     );
//
//     const previewPhotos: Photo[] = files.map((file, i) => ({
//         preview_url: URL.createObjectURL(file),
//         is_cover: photos.length === 0 && newFiles.length === 0 && i === 0,
//     }));
//
//      setNewFiles(prevNewFiles => {
//         console.log("Adding files to newFiles");
//         console.log("prevNewFiles.length", prevNewFiles.length); // Лог перед оновленням
//         console.log("files.length", files.length); // Лог перед додаванням нових файлів
//         return [...prevNewFiles, ...files];
//     });
//
//     setPhotos(prevPhotos => {
//         console.log("Adding files to photos");
//         console.log("prevPhotos.length", prevPhotos.length); // Лог перед оновленням
//         console.log("previewPhotos.length", previewPhotos.length); // Лог перед додаванням нових файлів
//         return [...prevPhotos, ...previewPhotos];
//     });
// };
//
//     const handleUpload = async () => {
//         if (!user?.token || newFiles.length === 0) return;
//         setLoading(true);
//         try {
//             const uploaded: Photo[] = [];
//             for (let i = 0; i < newFiles.length; i++) {
//                 const file = newFiles[i];
//                 const formData = new FormData();
//                 const coverIndex = photos.findIndex(p => p.is_cover);
//                 const isCover = i === coverIndex;
//                 formData.append("image", file);
//                 formData.append("is_cover", isCover ? "true" : "false");
//                 const res = await venueServices
//                     .venues
//                     .news({accessToken: user.token})(venueId)
//                     .images(newsId)
//                     .create(formData);
//
//                 uploaded.push({
//                     preview_url: res.data.image,
//                     is_cover: res.data.is_cover ?? false,
//                 });
//             }
//             setPhotos(prev => {
//                 const existing = prev.filter(p => !newFiles.some(f => URL.createObjectURL(f) === p.preview_url));
//                 return [...existing, ...uploaded];
//             });
//
//
//             onUploadComplete(uploaded.map(p => p.preview_url));
//             setNewFiles([]);
//         } catch (error) {
//             console.error("Error uploading photos", error);
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     const handleCoverChange = (index: number) => {
//         setPhotos((prevPhotos) =>
//             prevPhotos.map((photo, i) =>
//                 i === index ? {...photo, is_cover: true} : {...photo, is_cover: false}
//             )
//         );
//     };
//  const openFileDialog = () => {
//     inputRef.current?.click();
//   };
//
//     return (
//         <div className={styles.wrapper}>
//             <div className={styles.uploadWrapper}>
//                 <button
//                     type="button"
//                     onClick={openFileDialog}
//                     className={styles.inputPhoto}
//                 >
//                     Upload Photos (Max 7)
//                 </button>
//                 <input
//                     ref={inputRef}
//                     id="fileUpload"
//                     type="file"
//                     accept="image/*"
//                     multiple
//                     disabled={loading}
//                      style={{display: "none"}}
//                     onChange={handleFileChange}
//                 />
//                 <span className={styles.photoSpan}>{selectedFileName || "No file chosen"}</span>
//             </div>
//             <div className={styles.photoContainer}>
//                 {photos.map((photo, index) => (
//                     <div key={index} className={styles.photoArray}>
//                         <img
//                             src={photo.preview_url}
//                             alt={`Preview ${index}`}
//                             className={styles.photoImage}
//                         />
//                         <div className={styles.actions}>
//                             <label className={styles.checkLabel}>
//                                 <input
//                                     type="radio"
//                                     name="coverPhoto"
//                                     checked={photo.is_cover}
//                                     onChange={() => handleCoverChange(index)}
//                                     className={styles.check}
//                                 />
//                                 Cover
//                             </label>
//                             {newFiles[index] && (
//                                 <button type="button"
//                                         className={styles.deleteButton}
//                                         onClick={() => {
//                                             const urlToDelete = photo.preview_url;
//                                               setNewFiles(prev => prev.filter((_, i) => URL.createObjectURL(prev[i]) !== urlToDelete));
//                                             setPhotos(prev => prev.filter(p => p.preview_url !== urlToDelete));
//                                         }}>Delete</button>
//                             )}
//                         </div>
//                     </div>
//                 ))}
//             </div>
//
//                 <button
//                     onClick={handleUpload}
//                     disabled={loading || newFiles.length === 0}
//                     className={styles.submitButton}
//                 >
//                     {loading ? (
//                         <div className={`authButton ${styles.loaderWrapper}`}><LoaderComponent/></div> ) : "Save Photos"}
//                 </button>
//
//         </div>
//     );
// };
//
// export default PhotoMultipleUploadComponent;