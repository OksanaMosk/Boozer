"use client";

import React from 'react';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./SortableVenueItemComponent.module.css";

interface VenueItemProps {
    item: any;
    isOverlay?: boolean;
}

const SortableVenueItemComponent = ({item, isOverlay}: VenueItemProps) => {
    const venue = item.venue;
    const name = venue.name || "Unknown Venue";
    const address = venue.address || "No address provided";
    const id = venue.id || "Unknown Venue";
    const city = venue.city || "";
    const country = venue.country || "";
    const rawPhoto = venue.main_photo || item.venue_main_photo;
    const photoUrl = rawPhoto
        ? `http://localhost:8888/api/media/${rawPhoto}`
        : "/images/noVenue.webp";

    const totalVotes = item.total_votes || 0;
    const position = item.position ?? 0;
    console.log(item)
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({id: item.id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const content = (
        <div className={`${styles.venueWrapper} ${isOverlay ? styles.overlay : ''}`} {...listeners}>
            <div className={styles.venueItem}>
                {photoUrl ? (
                    <img
                        src={photoUrl}
                        alt={`${name} ${city}`}
                        className={styles.venuePoster}
                    />
                ) : (
                    <div className={styles.noPoster}>
                        <img
                            src="/images/noPosterVenue.webp"
                            alt="No poster"
                            className={styles.placeholder}
                        />
                    </div>
                )}
            </div>

            <div className={styles.venueInfoWrapper}>
                <div className={styles.venueInfo}>
                    <h2 className={styles.venueTitle}>
                        {name} <span className={styles.locationSmall}>{city} {country}</span>
                    </h2>
                    <hr className={styles.tagline}/>

                    <div className={styles.addressWrapper}>
                        <div className={styles.about}>
                            <p className={styles.value}>{address || "-"}</p>
                        </div>
                        <div className={styles.footerRow}>
                            <p className={styles.value}>Id: {item.venue?.id || item.venue_id}</p>
                            <div className={styles.stats}>
                                <span className={styles.posBadge}>Pos: {position}</span>
                                {totalVotes > 0 && <span className={styles.votes}>🔥 {totalVotes}</span>}
                                <span className={styles.posBadge}>Pos: {id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (isOverlay) return content;

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            {content}
        </div>
    );
};

export default SortableVenueItemComponent;
