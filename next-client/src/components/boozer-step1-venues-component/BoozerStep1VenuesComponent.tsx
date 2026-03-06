'use client';

import React from 'react';
import {PaginationComponent} from "@/components/pagination-component/PaginationComponent";
import {IVenue} from "@/models/IVenue";
import styles from "./BoozerStep1VenuesComponent.module.css";
import BoozerVenueComponent from "@/components/boozer-venue-component/BoozerVenueComponent";

interface VenuesComponentProps {
  venues: IVenue[];
  totalPages: number;
  onSelectVenue: (venue: IVenue) => void; // Додаємо цей пропс
}

const BoozerStep1VenuesComponent: React.FC<VenuesComponentProps> = ({venues, totalPages, onSelectVenue}) => {
    return (
        <div className={styles.venuesListContainer}>
            <ul className={styles.list}>
                {venues.map((venue) => (
                    <li key={venue.id}>
                        <BoozerVenueComponent
                            venue={venue}
                            onSelect={onSelectVenue}
                        />
                    </li>
                ))}
            </ul>
            <PaginationComponent totalPages={totalPages}/>
        </div>
    );
};

export default BoozerStep1VenuesComponent;
