"use client";

import React, { useEffect, useState } from "react";
import userService from "@/lib/services/userService";
import VenueListingComponent from "@/components/venue-listing-component/VenueListingComponent";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import ChatComponent from "@/components/chat-component/ChatComponent";
import { IVenueWithId} from "@/models/IVenue";
import styles from "./VenueAdminDashboardComponent.module.css";
import {useUser} from "@/app/contexts/UserProvider";

const VenueAdminDashboardComponent: React.FC = () => {
    const { user, loading: userLoading } = useUser();
    const [error, setError] = useState<string | null>(null);
    const [venues, setVenues] = useState<IVenueWithId[]>([]);
    const [venuesLoading, setVenuesLoading] = useState(true);

    useEffect(() => {
        if (!user?.id || !user?.token) return;
        const loadVenues = async () => {
            try {
                setVenuesLoading(true);
                const response = await userService.getUserVenues(
                    String(user.id), {accessToken: user.token!}
                );
                setVenues(
                    response.data.venues.map((v) => ({
                        ...v,
                        id: v.id!,
                    }))
                );
            } catch {
                setVenues([])
                setError("Failed to load venues.");
            }
            finally {
                setVenuesLoading(false)
            }
        };

      void loadVenues();
    }, [user?.id, user?.token]);

    const handleDelete = (venueId: string) => {
        setVenues((prev) => prev.filter((c) => c.id !== venueId));
        alert('Venue deleted successfully');
    };

    const handleStatusChange = (venueId: string, status: string) => {
        setVenues((prev) =>
            prev.map((venue) => (venue.id === venueId ? {...venue, status} : venue))
        );
    };
    if (userLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 70 }}>
                <LoaderComponent />
            </div>
        );
    }
    if (!user || !user?.id || !user?.token) {
        return <p className={styles.errorText}>Please log in.</p>;
    }
    if (error) return <p className={styles.errorText}>{error}</p>;

    return (

        <><h2 className={styles.subtitle} >My Venue Listings</h2>
            <div className={styles.dashboard}>

                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Main Photo</th>
                        <th>City</th>
                        <th>Country</th>
                        <th>Status</th>
                        <th>Actions</th>
                        <th>Navigate</th>
                        <th>Stats</th>
                    </tr>
                    </thead>

                    <tbody>
                    {venuesLoading ? (
                        <tr>
                            <td colSpan={9}>
                                <div className={styles.loaderWrapper}>
                                    <LoaderComponent/>
                                </div>
                            </td>
                        </tr>
                    ) : venues.length > 0 ? (
                        venues.map((venue) => (
                            <VenueListingComponent
                                key={venue.id}
                                venue={venue}
                                onDelete={handleDelete}
                                onStatusChange={handleStatusChange}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan={9}>No venues found.</td>
                        </tr>
                    )}
                    </tbody>
                </table>


            </div>
            {user && (
                <div className={styles.chatWrapper}>
                    <h3 style={{margin: "40px auto", textAlign: "center", width: "fit-content"}}>Chat with Buyers</h3>
                    {user?.id && (
                        <ChatComponent ownerId={String(user.id)}/>
                    )}

                </div>
            )}</>
    );
};

export default VenueAdminDashboardComponent;
