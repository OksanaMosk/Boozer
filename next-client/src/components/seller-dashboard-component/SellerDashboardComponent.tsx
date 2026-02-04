"use client";

import React, { useEffect, useState } from "react";
import userService from "@/lib/services/userService";
import CarListingComponent from "@/components/car-listing-component/CarListingComponent";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";

import ChatComponent from "@/components/chat-component/ChatComponent";
import { ICar } from "@/models/ICar";
import { IUser } from "@/models/IUser";
import styles from "./SellerDashboardComponent.module.css";
import {useSession} from "next-auth/react";
import {loadUser} from "@/utils/authUtils";

const SellerDashboardComponent: React.FC = () => {
    const [cars, setCars] = useState<ICar[]>([]);
    const {data: session, status} = useSession();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [user, setUser] = useState<IUser | null>(null);

useEffect(() => {
    (async () => {
        setLoading(true);
        try {
            const userData = await loadUser(status === "authenticated" ? session?.user : undefined);
            setUser(userData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    })();
}, [session, status]);


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
