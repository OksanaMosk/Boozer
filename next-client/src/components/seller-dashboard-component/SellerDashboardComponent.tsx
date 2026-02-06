"use client";

import React, { useEffect, useState } from "react";
import userService from "@/lib/services/userService";
import CarListingComponent from "@/components/car-listing-component/CarListingComponent";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import ChatComponent from "@/components/chat-component/ChatComponent";
import { ICar } from "@/models/ICar";
import styles from "./SellerDashboardComponent.module.css";
import {useUser} from "@/app/contexts/UserProvider";
import {useSession} from "next-auth/react";

const SellerDashboardComponent: React.FC = () => {
    const [cars, setCars] = useState<ICar[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const {data: session} = useSession();
    const {user} = useUser();


    useEffect(() => {
        if (!user?.id) return;

        const loadCars = async () => {
            setLoading(true);
            try {

                 if (!session?.user?.accessToken) {
        console.error("No access token available!");
        return;
      }
                const response = await userService.getUserCars(String(user.id), { accessToken: session.user.accessToken });
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
if (!user) {
        return <div style={{display: "flex", justifyContent: "center", marginTop: 50}}>
            <LoaderComponent/>
        </div>;
    }

    if (error) return <p className={styles.errorText}>{error}</p>;

    return (
        <div className={styles.dashboard}>
              <h1 className={styles.header}>MANAGER DASHBOARD</h1>
            {user ? (
                <div className={styles.userInfo}>
                    <p className={styles.text}>
                        Welcome, {user.profile?.name} {user.profile?.surname}!
                    </p>
                    <p className={styles.text}>Email: {user.email}</p>
                    <p className={styles.text}>Role: {user.role}</p>
                    {user.profile.birth_date && <p className={styles.text}>Age: {user.profile.birth_date.toString()}</p>}

                </div>
            ) : (
                <p className={styles.text}>No user data available.</p>
            )}
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
