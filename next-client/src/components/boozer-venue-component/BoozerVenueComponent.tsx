"use client";

import React, { useState, useEffect } from "react";
import { IVenue } from "@/models/IVenue";
import VenueComponent from "@/components/venue-component/VenueComponent";
import styles from "./BoozerVenueComponent.module.css";

interface Props {
    venue: IVenue;
    selected?: boolean;
    onSelect?: (venue: IVenue) => void;
    onDeselect?: (venue: IVenue) => void;
}

const BoozerVenueComponent: React.FC<Props> = ({venue, selected = false, onSelect, onDeselect}) => {
    const [isSelected, setIsSelected] = useState(selected);

    const handleToggle = () => {
        if (isSelected) {
            setIsSelected(false);
            if (onDeselect) onDeselect(venue);
        } else {
            setIsSelected(true);
            if (onSelect) onSelect(venue);
        }
    };

    useEffect(() => {
        setIsSelected(selected);
    }, [selected]);

    return (
        <div
            className={`${styles.wrapper} ${isSelected ? styles.selected : ""}`}
        >
            <VenueComponent venue={venue}/>
            <button
                className={styles.selectButton}
                onClick={handleToggle}
            >
                {isSelected ? "Selected 🍹" : "Choose"}
            </button>
        </div>
    );
};

export default BoozerVenueComponent;