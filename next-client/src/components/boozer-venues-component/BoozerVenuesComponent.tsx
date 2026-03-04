'use client';

import React from 'react';
import Link from "next/link";
import VenueComponent from "@/components/venue-component/VenueComponent";
import {PaginationComponent} from "@/components/pagination-component/PaginationComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import {IVenue} from "@/models/IVenue";
import styles from "./BoozerVenuesComponent.module.css";
import BoozerVenueComponent from "@/components/boozer-venue-component/BoozerVenueComponent";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";

interface VenuesComponentProps {
  venues: IVenue[];
  totalPages: number;
}


const BoozerVenuesComponent: React.FC<VenuesComponentProps > = ({venues, totalPages}) => {
    return (
        <div className={styles.venuesListContainer}>
            <ul className={styles.list}>
                {venues.map((venue) => (
                    <li key={venue.id}>
                            <BoozerVenueComponent venue={venue}/>
                    </li>
                ))}
            </ul>
            <PaginationComponent totalPages={totalPages}/>
        </div>
    );
};

export default BoozerVenuesComponent;





