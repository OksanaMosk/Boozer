"use client";

import React, { useEffect, useState } from "react";
import userService from "@/lib/services/userService";
import venueService from "@/lib/services/venueService";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import { IVenue } from "@/models/IVenue";
import styles from "./VenueManagementComponent.module.css";
import {useUser} from "@/app/contexts/UserProvider";



const VenueManagementComponent = () => {
    const [cars, setCars] = useState<IVenue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
const { user} = useUser();

    useEffect(() => {
        if (!user?.id || !user?.token) return;

    const loadCars = async () => {
        try {
            setLoading(true);
            const response = await userService.getUserCars(user.id!, {
               accessToken: user.token!
            });

            const carsData = response.data?.cars || response.data || [];
            setCars(carsData);
        } catch (err) {
            console.error(err);
            setError("Failed to load venues");
        } finally {
            setLoading(false);
        }
    };

      void loadCars();
}, [user]);


    const handleStatusChange = async (carId: string, newStatus: string) => {
        if(!user?.token) return;
        try {
            await venueService.update(carId, {status: newStatus}, {accessToken: user.token!});
            setCars(prev =>
                prev.map(car => (car.id === carId ? {...car, status: newStatus} : car))
            );
        } catch  {
            alert("Error updating status on server");
        }
    };

    const handleDelete = async (carId: string) => {
        if (!confirm("Are you sure you want to delete this car?")) return;
        if(!user?.token) return;
        try {

            await venueService.delete(carId, {accessToken: user.token!});
            setCars(prev => prev.filter(car => car.id !== carId));
        } catch {
            alert("Error deleting car on server");
        }
    };

    if (loading) return <div style={{display: "flex", justifyContent: "center", marginTop: 50}}>
        <LoaderComponent/>
    </div>;

    if (error) return <p className={styles.error}>{error}</p>;

    return (
        <div>
            <h3>Cars of User {user?.id}</h3>
            {cars.length > 0 ? (
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>Id</th>
                        <th>Brand</th>
                        <th>Model</th>
                        <th>Year</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {cars.map(car => (
                        <tr key={car.id} className={styles.tableRow}>
                            <td>{car.id}</td>
                            <td>{car.brand}</td>
                            <td>{car.model}</td>
                            <td>{car.year}</td>
                            <td>{car.price}</td>
                            <td className={car.status === "active" ? styles.statusActive : styles.statusInactive}>
                                {car.status}
                            </td>
                            <td className={styles.actions}>
                                <select
                                    value={car.status}
                                    onChange={(e) => handleStatusChange(car.id, e.target.value)}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="pending">Pending</option>
                                </select>

                                <button onClick={() => handleDelete(car.id)} className={styles.deleteButton}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p>No cars found for this user.</p>
            )}
        </div>
    );
};

export default VenueManagementComponent;
