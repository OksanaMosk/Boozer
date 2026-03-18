import React from "react";
import styles from "./NewsGallery.module.css"

export const NewsGallery = ({images}: { images: any[] }) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const handlePhotoChange = (direction: "next" | "prev") => {
        if (direction === "next" && currentIndex < images.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else if (direction === "prev" && currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };
    if (!images || images.length === 0) return <div>No photos</div>;
    return (
        <div className={styles.contentGallery}>
            <div className={styles.singleGalleryWrapper}>
                <button
                    onClick={() => handlePhotoChange("prev")}
                    disabled={currentIndex === 0}
                    className={styles.arrow}
                > ←
                </button>

                <img
                    src={images[currentIndex].image}
                    alt="News"
                    className={styles.singleThumbnail}
                />

                <button
                    onClick={() => handlePhotoChange("next")}
                    disabled={currentIndex === images.length - 1}
                    className={styles.arrow}
                > →
                </button>
            </div>
        </div>
    );
};
