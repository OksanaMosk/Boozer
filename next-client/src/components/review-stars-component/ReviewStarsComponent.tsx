"use client"

import styles from "./ReviewStarsComponent.module.css";

interface Props {
    rating: number;
    interactive?: boolean;
    onStarClick?: (val: number) => void;
}

export const ReviewStarsComponent = ({ rating, interactive, onStarClick }: Props) => {
    return (
        <div className={`${styles.starsWrapper} ${interactive ? styles.interactive : ""}`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`${styles.star} ${star <= rating ? styles.filled : styles.empty}`}
                    onClick={() => interactive && onStarClick?.(star)}
                >
                    ✸
                </span>
            ))}
            {rating > 0 && <span className={styles.starRating}>({rating})</span>}
        </div>
    );
};