"use client";

import React, { useEffect, useState } from "react";
import userService from "@/lib/services/userService";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import {IVenueWithId} from "@/models/IVenue";
import styles from "./VenueManagementComponent.module.css";
import VenueListingComponent from "@/components/venue-listing-component/VenueListingComponent";
import {useUser} from "@/app/contexts/UserProvider";

interface Props {
  userId: string;
}

const VenueManagementComponent: React.FC<Props> = ({userId}) => {
    const [venuesLoading, setVenuesLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [venues, setVenues] = useState<IVenueWithId[]>([]);
    const {user} = useUser();

    useEffect(() => {
        if (!userId || !user) {
            setError("User ID is missing");
            return;
        }

        const loadVenues = async () => {
            try {
                setVenuesLoading(true);
                const response = await userService.getUserVenues(String(userId), { accessToken: user.token! });
                setVenues(response.venues.map((v) => ({ ...v, id: v.id! })));
            } catch (err) {
                setVenues([]);
                setError("Failed to load venues.");
            } finally {
                setVenuesLoading(false);
            }
        };
        void loadVenues();
    }, [userId, user?.token]);


    const handleDelete = (venueId: string) => {
        setVenues((prev) => prev.filter((v) => v.id !== venueId));
        alert('Venue deleted successfully');
    };


    if (venuesLoading) return <div style={{display: "flex", justifyContent: "center", marginTop: 50}}>
        <LoaderComponent/>
    </div>;

    if (error) return <p className={styles.errorText}>{error}</p>;

    return (
        <div>
            <h2 className={styles.title} >Manage Venue Listings</h2>
            <div className={styles.table}>
                {venuesLoading ? (
                    <LoaderComponent/>
                ) : venues.length > 0 ? (
                    venues.map((venue) => (
                        <div key={venue.id} className={styles.venueRow}>
                            <VenueListingComponent
                                venue={venue}
                                onDelete={handleDelete}
                                onStatusChange={() => {
                                }}
                            />
                        </div>
                    ))
                ) : (
                    <p>You haven't added any venues yet.</p>
                )}
            </div>
        </div>
    );
};

export default VenueManagementComponent;