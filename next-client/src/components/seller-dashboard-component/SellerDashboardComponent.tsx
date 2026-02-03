"use client";

import React, { useEffect, useState } from "react";
import { authService } from "@/lib/services/authService";
import userService from "@/lib/services/userService";
import CarListingComponent from "@/components/car-listing-component/CarListingComponent";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";

import ChatComponent from "@/components/chat-component/ChatComponent";
import { ICar } from "@/models/ICar";
import { IUser } from "@/models/IUser";
import styles from "./SellerDashboardComponent.module.css";

const SellerDashboardComponent: React.FC = () => {
    const [user, setUser] = useState<IUser | null>(null);
    const [cars, setCars] = useState<ICar[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            const token = document.cookie
                .split("; ")
                .find((row) => row.startsWith("authToken="))
                ?.split("=")[1];

            if (!token) {
                setError("Please activate your account.");
                setLoading(false);
                return;
            }

            try {
                const userData = await authService.getCurrentUser(token);
                setUser(userData);
            } catch {
                const refreshToken = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("refreshToken="))
                    ?.split("=")[1];

                if (!refreshToken) {
                    setError("Please log in again.");
                    setLoading(false);
                    return;
                }

                try {
                    const tokens = await authService.refreshToken(refreshToken);
                    const userData = await authService.getCurrentUser(tokens.access);
                    setUser(userData);
                } catch {
                    setError("Your session has expired. Please log in again.");
                }
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        const loadCars = async () => {
            setLoading(true);
            try {
                if (!user?.id) return;
                const response = await userService.getUserCars(String(user.id));
                setCars(response.data.cars);
            } catch {
                setError("Failed to load cars.");
            } finally {
                setLoading(false);
            }
        };

        loadCars();
    }, [user]);

    const handleDelete = (carId: string) => {
        setCars((prev) => prev.filter((c) => c.id !== carId));
    };

    const handleStatusChange = (carId: string, status: string) => {
        setCars((prev) =>
            prev.map((car) => (car.id === carId ? {...car, status} : car))
        );
    };

    if (loading)
        return (
            <div style={{display: "flex", justifyContent: "center", marginTop: 50}}>
                <LoaderComponent/>
            </div>
        );

    if (error) return <p className={styles.errorText}>{error}</p>;

    return (
        <div className={styles.dashboard}>
            <h2>My Car Listings</h2>
            <div className={styles.cardsContainer}>
                {cars.length > 0 ? (
                    cars.map((car) => (
                        <CarListingComponent
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
                    <h3 style={{margin: "40px auto", textAlign: "center", width: "fit-content"}}>Chat with Admin</h3>
                    {user?.id && (
                        <ChatComponent ownerId={String(user.id)}/>
                    )}

                </div>
            )}

        </div>
    );
};

export default SellerDashboardComponent;
