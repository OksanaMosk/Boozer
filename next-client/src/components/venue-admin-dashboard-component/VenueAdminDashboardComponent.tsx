"use client";

import React, { useEffect, useState } from "react";
import userService from "@/lib/services/userService";
import VenueListingComponent from "@/components/venue-listing-component/VenueListingComponent";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import ChatComponent from "@/components/chat-component/ChatComponent";
import { IVenue } from "@/models/IVenue";
import { IUser } from "@/models/IUser";
import styles from "./VenueAdminDashboardComponent.module.css";
import {useUser} from "@/app/contexts/UserProvider";

const VenueAdminDashboardComponent: React.FC = () => {
    const { user, loading: userLoading } = useUser();
    const [error, setError] = useState<string | null>(null);
    const [venues, setVenues] = useState<IVenue[]>([]);

    useEffect(() => {
   if (!user?.id || !user?.token) return;

        const loadVenues = async () => {
            try {
                const response = await userService.getUserVenues(
                    String(user.id), { accessToken: user.token! }
                );

                setVenues(response.data.venues);
            } catch {
                 setVenues([])
                setError("Failed to load venues.");
            }
        };

        loadVenues();
    }, [user?.id, user?.token]);


    const handleDelete = (venueId: string) => {
        setVenues((prev) => prev.filter((c) => c.id !== venueId));
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
        <div className={styles.dashboard}>
            <h2>My Venue Listings</h2>
            <div className={styles.cardsContainer}>
                {venues.length > 0 ? (
                    venues.map((venue) => (
                        <VenueListingComponent
                            key={venue.id}
                           venue={venue}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                        />
                    ))
                ) : (
                    <p>No venues found.</p>
                )}
            </div>
            {user && (
                <div style={{margin: "40px auto", width: "400px"}}>
                    <h3 style={{margin: "40px auto", textAlign: "center", width: "fit-content"}}>Chat with Buyers</h3>
                    {user?.id && (
                        <ChatComponent ownerId={String(user.id)}/>
                    )}

                </div>
            )}

        </div>
    );
};

export default VenueAdminDashboardComponent;
