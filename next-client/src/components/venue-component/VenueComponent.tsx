"use client";

import React from "react";
import Image from "next/image";
import { IVenue } from "@/models/IVenue";
import styles from "./VenueComponent.module.css";

interface Props {
    venue: IVenue;
}

const VenueComponent: React.FC<Props> = ({ venue }) => {
      console.log("Venue photos:", venue.photos);
    const mainPhoto =
        venue.photos?.find((p) => p.is_main) || venue.photos?.[0];

    return (
        <div className={styles.venueWrapper}>
            <div className={styles.venueItem}>
                {mainPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={mainPhoto.photo}
                        alt={`${venue.name} ${venue.city}`}
                        width={280}
                        height={300}
                        className={styles.venuePoster}
                    />
                ) : (
                    <div className={styles.noPoster}>
                        <Image
                            src="/images/noEye.png"
                            alt="No poster"
                            className={styles.placeholder}
                            width={280}
                            height={300}
                        />
                    </div>
                )}
            </div>
            <div className={styles.venueInfoWrapper}>
                <div className={styles.venueInfo}>
                    <h2 className={styles.venueTitle}>
                        {venue.name} {venue.country} {venue.city}
                    </h2>
                    <hr className={styles.tagline}/>
                    <div className={styles.addressWrapper}>
                        <div className={styles.about}>
                            <p className={styles.value}>{venue.phone || "-"}</p>
                            <p className={styles.value}>{venue.address || "-"}</p>
                        </div>
                        <div className={styles.footerRow}>
                            <p className={styles.value}>Id: {venue.id}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VenueComponent;


