"use client";

import React from "react";
import Image from "next/image";
import {IVenue} from "@/models/IVenue";
import styles from "./VenueComponent.module.css";

interface Props {
    venue: IVenue;
}

const VenueComponent: React.FC<Props> = ({venue}) => {

    return (
        <div
            className={styles.venuedWrapper}>
            <div className={styles.venueItem}>
                {venue.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={venue.photos[0].photo}
                        alt={`${venue.brand} ${venue.model}`}
                        width={250}
                        height={120}
                        className={styles.venuePoster}
                    />
                ) : (
                    <div className={styles.noPoster}>
                        <Image
                            src='/images/noPoster.png'
                            alt="No poster"
                            className={styles.placeholder}
                            width={250}
                            height={120}
                        />
                    </div>
                )}
                <div className={styles.right}>
                    <span className={styles.label}>Price:  </span>{" "}
                    <span className={styles.value}>
            </span>
                </div>
            </div>

            <div className={styles.venueInfoWrapper}>
                <div className={styles.venueInfo}>
                    <h2 className={styles.venueTitle}>
                        {venue.brand} {venue.model}{" "} {venue.year}
                    </h2>

                    <div className={styles.about}>
                        <div className={styles.imageContainer}>
                            <img
                                src="/images/speed.png"
                                alt="speed"
                                width={24}
                                height={24}
                                className={styles.img}
                            />
                            <p className={styles.imgAbout}>Max speed </p>
                            <p className={styles.value}>{venue.max_speed} km/h</p>
                        </div>

                        <div className={styles.imageContainer}>
                            <img
                                src="/images/seat.png"
                                alt="seat"
                                width={24}
                                height={24}
                                className={styles.img}
                            />
                            <p className={styles.imgAbout}>Seats</p>
                            <p className={styles.value}>{venue.seats_count}</p>
                        </div>

                        <div className={styles.imageContainer}>
                            <img
                                src="/images/engine.png"
                                alt="Engine Volume"
                                width={24}
                                height={24}
                                className={styles.img}
                            />
                            <p className={styles.imgAbout}>Engine</p>
                            <p className={styles.value}>{venue.engine_volume} L</p>
                        </div>

                        <div className={styles.imageContainer}>
                            <img
                                src="/images/fuel.png"
                                alt="fuel"
                                width={24}
                                height={24}
                                className={styles.img}
                            />
                            <p className={styles.imgAbout}>Fuel Type</p>
                            <p className={styles.value}>{venue.fuel_type}</p>
                        </div>
                    </div>
                    <hr className={styles.tagline}></hr>
                    <div className={styles.footerRow}>
                        <div className={styles.row}>
                            <span className={styles.value}>{venue.location}</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Id:  </span>{" "}
                            <span className={styles.value}> {venue.id}</span>
                        </div>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.value}>{venue.condition}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VenueComponent;

