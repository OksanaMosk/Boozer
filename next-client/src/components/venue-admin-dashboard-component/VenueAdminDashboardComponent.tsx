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
    const [cars, setCars] = useState<IVenue[]>([]);

    useEffect(() => {
   if (!user?.id || !user?.token) return;

        const loadCars = async () => {
            try {
                const response = await userService.getUserVenues(
                    String(user.id), { accessToken: user.token! }
                );

                setCars(response.data.venues);
            } catch {
                 setCars([])
                // setError("Failed to load venues.");
            }
        };

        loadCars();
    }, [user?.id, user?.token]);


    const handleDelete = (carId: string) => {
        setCars((prev) => prev.filter((c) => c.id !== carId));
    };

    const handleStatusChange = (carId: string, status: string) => {
        setCars((prev) =>
            prev.map((car) => (car.id === carId ? {...car, status} : car))
        );
    };

    if (userLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
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
            <h2>My Car Listings</h2>
            <div className={styles.cardsContainer}>
                {cars.length > 0 ? (
                    cars.map((car) => (
                        <VenueListingComponent
                            key={car.id}
                            car={car}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                        />
                    ))
                ) : (
                    <p>No cars found.</p>
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
