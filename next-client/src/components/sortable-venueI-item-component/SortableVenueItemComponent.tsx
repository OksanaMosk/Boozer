"use client";

import React from 'react';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./SortableVenueItemComponent.module.css";

interface VenueItemProps {
    item: any;
    position: number;
    showIndex?: boolean;
    isOverlay?: boolean;
    onDelete?: (venueId: string | number, collectionId: string | number) => void;
}

const SortableVenueItemComponent = ({item, position, showIndex, isOverlay, onDelete}: VenueItemProps) => {
    const venue = item.venue;
    const name = venue.name || "Unknown Venue";
    const id = venue.id || "Unknown Venue";
    const city = venue.city || "";
    const country = venue.country || "";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const rawPhoto = venue.main_photo || item.venue_main_photo;
    const baseMediaUrl = apiUrl && apiUrl.endsWith('/api') ? apiUrl : 'http://localhost:8888/api';

    const photoUrl = rawPhoto
    ? (rawPhoto.startsWith('http') ? rawPhoto : `${baseMediaUrl}/media/${rawPhoto}`)
    : "/images/noVenue.webp";
    const totalVotes = venue.total_votes || 0;

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
                    <h2 className={styles.venueTitle}>{name}</h2>
                    <div className={styles.addressWrapper}>
                        <p className={styles.address}>{city}, {country}</p>

                        <div className={styles.about}>
                            <p className={styles.value}>Id: {item.venue?.id || item.venue_id}</p>
                            <div className={styles.footerRow}>
                                {showIndex && <p className={styles.posBadge}>Position: {position}</p>}
                                {totalVotes > 0 && <p className={styles.posBadge}>Votes: <strong
                                    className={styles.votes}>{totalVotes}</strong> 💛</p>}
                                <p className={styles.posBadge}>{id}</p>

                            </div>
                        </div>
                    </div>
                </div>
                {!isOverlay && onDelete && (
                    <button
                        className={styles.button}
                        onClick={(e) => {
                            e.stopPropagation();
                          onDelete(item.venue.id, item.collection_id);
                        }}
                    >
                        Delete from collection
                    </button>
                )}
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
