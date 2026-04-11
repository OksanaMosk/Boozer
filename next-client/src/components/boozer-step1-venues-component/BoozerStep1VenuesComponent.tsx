'use client';

import React from 'react';
import {IVenue} from "@/models/IVenue";
import {PaginationComponent} from "@/components/pagination-component/PaginationComponent";
import BoozerVenueComponent from "@/components/boozer-venue-component/BoozerVenueComponent";
import styles from "./BoozerStep1VenuesComponent.module.css";

interface VenuesComponentProps {
  venues: IVenue[];
  totalPages: number;
  onSelectVenue: (venue: IVenue) => void;
}

const BoozerStep1VenuesComponent: React.FC<VenuesComponentProps> = ({venues, totalPages, onSelectVenue}) => {
    return (
        <div className={styles.venuesListContainer}>
            <ul className={styles.list}>
                 {venues
                    .filter(venue => venue.status === 'active')
                    .map((venue) => (
                    <li key={venue.id}>
                        <BoozerVenueComponent
                            venue={venue}
                            onSelect={onSelectVenue}
                        />
                    </li>
                ))}
            </ul>
           {totalPages > 1 && (
                <div className={styles.paginationWrapper}>
                    <PaginationComponent totalPages={totalPages}/>
                </div>
            )}
        </div>
    );
};

export default BoozerStep1VenuesComponent;
