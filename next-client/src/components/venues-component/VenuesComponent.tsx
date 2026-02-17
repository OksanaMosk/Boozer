'use client';

import React from 'react';
import Link from "next/link";
import VenueComponent from "@/components/venue-component/VenueComponent";
import {PaginationComponent} from "@/components/pagination-component/PaginationComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import {IVenue} from "@/models/IVenue";
import styles from "./VenuesComponent.module.css";

interface VenuesComponentProps {
  venues: IVenue[];
  totalPages: number;
}


const VenuesComponent: React.FC<VenuesComponentProps > = ({venues, totalPages}) => {
    return (
        <div className={styles.venuesListContainer}>
            <ul className={styles.list}>
                {venues.map((venue) => (
                    <li key={venue.id}>
                        <Link
                            href={`/venues/${venue.id}`}
                            className={styles.link}
                        >
                            <VenueComponent venue={venue}/>
                        </Link>
                    </li>
                ))}
            </ul>

            <PaginationComponent totalPages={totalPages}/>
            <ButtonScrollTopComponent/>
        </div>
    );
};

export default VenuesComponent;





