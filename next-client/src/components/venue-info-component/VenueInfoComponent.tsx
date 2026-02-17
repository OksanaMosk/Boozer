"use client";

import React, { useMemo, useState } from "react";
import ChatComponent from "../chat-component/ChatComponent";
import { IVenue } from "@/models/IVenue";
import styles from "./VenueInfoComponent.module.css";

interface Props {
    venue: IVenue;
}

const VenueInfoComponent: React.FC<Props> = ({ venue }) => {
    const photos = venue.photos ?? [];

    const mainPhoto = useMemo(() => {
        return photos.find(p => p.is_main) || photos[0] || null;
    }, [photos]);

    const [currentIndex, setCurrentIndex] = useState(
        mainPhoto ? photos.findIndex(p => p.id === mainPhoto.id) : 0
    );

    const prevPhoto = () => {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
    };

    const nextPhoto = () => {
        setCurrentIndex(prev => Math.min(prev + 1, photos.length - 1));
    };

    const currentPhoto = photos[currentIndex];

    return (
        <div>
            <div className={styles.container}>
                <div className={styles.flexRowResponsive}>

                    {/* MAIN PHOTO */}
                    {mainPhoto ? (
                        <img
                            src={mainPhoto.photo}
                            alt={venue.name}
                            width={500}
                            height={400}
                            className={styles.venuePoster}
                        />
                    ) : (
                        <div className={styles.noPoster}>
                            <img
                                src="/images/noPoster.png"
                                alt="No poster"
                                width={500}
                                height={400}
                                className={styles.placeholder}
                            />
                        </div>
                    )}

                    <div className={styles.content}>
                        <h1 className={styles.title}>
                            {venue.name}
                        </h1>

                        <p className={styles.location}>
                            {venue.country}, {venue.city}
                        </p>

                        <hr className={styles.divider} />

                        <div className={styles.details}>
                            <p><strong>ID:</strong> {venue.id}</p>
                            {venue.address && (
                                <p><strong>Address:</strong> {venue.address}</p>
                            )}
                            {venue.phone && (
                                <p><strong>Phone:</strong> {venue.phone}</p>
                            )}
                        </div>

                        {/* GALLERY */}
                        {photos.length > 1 && currentPhoto && (
                            <div className={styles.singleGalleryWrapper}>
                                <button
                                    className={styles.arrow}
                                    onClick={prevPhoto}
                                    disabled={currentIndex === 0}
                                >
                                    ←
                                </button>

                                <img
                                    src={currentPhoto.photo}
                                    alt={`Photo ${currentIndex + 1}`}
                                    className={styles.singleThumbnail}
                                />

                                <button
                                    className={styles.arrow}
                                    onClick={nextPhoto}
                                    disabled={currentIndex === photos.length - 1}
                                >
                                    →
                                </button>
                            </div>
                        )}

                        {venue.description && (
                            <>
                                <hr className={styles.divider} />
                                <p className={styles.overview}>
                                    <strong>Description:</strong> {venue.description}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* CHAT */}
            <div style={{ margin: "40px auto", width: "400px" }}>
                <h3 style={{ textAlign: "center" }}>
                    Chat with Venue Admin
                </h3>

                {venue.venue_admin_id ? (
                    <ChatComponent ownerId={String(venue.venue_admin_id)} />
                ) : (
                    <p style={{ textAlign: "center" }}>
                        Venue Admin not available
                    </p>
                )}
            </div>
        </div>
    );
};

export default VenueInfoComponent;
