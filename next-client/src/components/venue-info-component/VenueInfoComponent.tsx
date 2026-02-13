"use client"

import React from "react";
import { useState } from "react";
import ChatComponent from "../chat-component/ChatComponent";
import { IVenue } from "@/models/IVenue";
import styles from "./VenueInfoComponent.module.css";

interface venueInfoComponentProps {
    venue: IVenue;
}

const VenueInfoComponent: React.FC<venueInfoComponentProps> = ({venue}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const prevPhoto = () => {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
    };
    const nextPhoto = () => {
        setCurrentIndex((prev) =>
            Math.min(prev + 1, venue.photos.length - 1)
        );
    };

    return (
        <div>
            <div className={styles.container}>
                <div className={styles.flexRowResponsive}>
                    {venue.photos[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={venue.photos[0].photo}
                            alt={`${venue.brand} ${venue.model}`}
                            width={500}
                            height={400}
                            sizes="(max-width: 600px) 100vw, 500px"
                            className={styles.venuePoster}
                        />
                    ) : (
                        <div className={styles.noPoster}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src='/images/noPoster.png'
                                alt="No poster"
                                className={styles.placeholder}
                                width={500}
                                height={400}
                                sizes="(max-width: 600px) 100vw, 500px"
                            />
                        </div>
                    )}
                    <div className={styles.content}>
                        <h1 className={styles.title}>
                            {venue.brand} {venue.model} (<span className={styles.spanYear}> {venue.year}{' '} </span>)
                        </h1>

                        <div className={styles.seler}>
                            <p>{venue.condition}</p>
                            <p>Venue Admin id: {venue.venue_admin_id}</p>
                        </div>

                        <hr className={styles.tagline}></hr>
                        <div className={styles.details}>
                            <div className={styles.top}>
                                <p><strong>ID:</strong> {venue.id}</p>
                                <div>
                                    <p><strong>Price: {venue.price.toLocaleString()} {venue.currency}</strong></p>
                                </div>
                            </div>

                            <div className={styles.aboutvenue}>
                                <div className={styles.about}>
                                    <div className={styles.imageContainer}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src="/images/road.png"
                                            alt="road"
                                            width={24}
                                            height={24}
                                            className={styles.img}
                                        />
                                        <p className={styles.imgAbout}>Traveled</p>
                                        <p className={styles.imgText}>{venue.mileage.toLocaleString()} km</p>
                                    </div>
                                    <div className={styles.imageContainer}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src="/images/speed.png"
                                            alt="speed"
                                            width={24}
                                            height={24}
                                            className={styles.img}
                                        />
                                        <p className={styles.imgAbout}>Max speed </p>
                                        <p className={styles.imgText}> {venue.max_speed} km/h</p>
                                    </div>
                                    <div className={styles.imageContainer}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src="/images/seat.png"
                                            alt="seat"
                                            width={24}
                                            height={24}
                                            className={styles.img}
                                        />
                                        <p className={styles.imgAbout}>Seats</p>
                                        <p className={styles.imgText}> {venue.seats_count}</p>
                                    </div>
                                </div>

                                <div className={styles.about}>
                                    <div className={styles.imageContainer}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src="/images/engine.png"
                                            alt="Engine Volume"
                                            width={24}
                                            height={24}
                                            className={styles.img}
                                        />
                                        <p className={styles.imgAbout}>Engine Volume</p>
                                        <p className={styles.imgText}> {venue.engine_volume.toLocaleString()}</p>
                                    </div>
                                    <div className={styles.imageContainer}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src="/images/climate.png"
                                            alt="AC"
                                            width={24}
                                            height={24}
                                            className={styles.img}
                                        />
                                        <p className={styles.imgAbout}>AC</p>
                                        <p className={styles.imgText}> {venue.has_air_conditioner ? "Yes" : "No"}</p>
                                    </div>
                                    <div className={styles.imageContainer}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src="/images/fuel.png"
                                            alt="fuel"
                                            width={24}
                                            height={24}
                                            className={styles.img}
                                        />
                                        <p className={styles.imgAbout}>Fuel Type</p>
                                        <p className={styles.imgText}> {venue.fuel_type}</p>
                                    </div>
                                </div>
                            </div>

                            <p><strong>Location:</strong> {venue.location}</p>
                        </div>
                        <hr className={styles.tagline}></hr>

                        {venue.photos?.length > 0 && (
                            <div className={styles.singleGalleryWrapper}>
                                <button
                                    className={styles.arrow}
                                    onClick={prevPhoto}
                                    disabled={currentIndex === 0}
                                >
                                    ←
                                </button>

                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={venue.photos[currentIndex].photo}
                                    alt={`photo ${currentIndex + 1}`}
                                    className={styles.singleThumbnail}
                                />

                                <button
                                    className={styles.arrow}
                                    onClick={nextPhoto}
                                    disabled={currentIndex === venue.photos.length - 1}
                                >
                                    →
                                </button>
                            </div>
                        )}

                        {venue.description && (
                            <p className={styles.overview}><strong>Description:</strong> {venue.description}</p>
                        )}
                    </div>
                </div>

            </div>
            <div style={{margin: "40px auto", width: "400px"}}>
                <h3 style={{margin: "40px auto", textAlign: "center", width: "fit-content"}}>
                    Chat with Venue Admin
                </h3>
                {!venue ? (
                    <p>Loading venue info...</p>
                ) : venue.venue_admin_id ? (
                    <ChatComponent ownerId={String(venue.venue_admin_id)}/>
                ) : (
                    <p>Venue Admin not available</p>
                )}
            </div>
        </div>
    );
};

export default VenueInfoComponent;



