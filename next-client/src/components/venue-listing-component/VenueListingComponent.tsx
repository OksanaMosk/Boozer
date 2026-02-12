"use client";

import React, {useState, useEffect} from "react";
import Link from "next/link";
import axios from "axios";
import venueService from "@/lib/services/venueService";
import {IVenue} from "@/models/IVenue";
import styles from "./VenueListingComponent.module.css";
import {useUser} from "@/app/contexts/UserProvider";

interface CarStats {
    total_views: number;
    daily_views: number;
    weekly_views: number;
    monthly_views: number;
}

interface AveragePrice {
    USD: number;
    EUR: number;
    UAH: number;
}



interface Props {
    car: IVenue;
    onDelete?: (id: string) => void;
    onStatusChange?: (carId: string, status: string) => void;
}

const VenueListingComponent: React.FC<Props> = ({car, onDelete, onStatusChange}) => {
    const [status, setStatus] = useState<string>(car.status);
    const [stats, setStats] = useState<CarStats | null>(null);
    const [regionAvgPrice, setRegionAvgPrice] = useState<AveragePrice | null>(null);
    const [countryAvgPrice, setCountryAvgPrice] = useState<AveragePrice | null>(null);
    const [error, setError] = useState<string | null>(null);
    const isLocked = (car.edit_attempts ?? 0) >= 3;
  const  {user} = useUser()

    const activeUser = user;

    useEffect(() => {
        if (!activeUser) return;

        (async () => {
            try {
                setError(null);

                const [statsRes, regionRes, countryRes] = await Promise.all([
                    venueService.getStats(car.id),
                    venueService.getAveragePriceByRegion(car.location, car.model),
                    venueService.getAveragePriceByCountry(car.model),
                ]);

                setStats(statsRes.data);
                setRegionAvgPrice(regionRes.data.average_price);
                setCountryAvgPrice(countryRes.data.average_price);

            } catch {
                setError("Error loading stats and prices");
            }
        })();
    }, [car.id, car.location, activeUser, car.model]);


    const handleStatusChange = async () => {
        if (status === "pending") {
            alert("You cannot change status while the car is pending review.");
            return;
        }
        if (!user?.token) return

        try {
            const newStatus = status === "active" ? "inactive" : "active";
            await venueService.update(car.id, {status: newStatus}, {accessToken:user.token});
            setStatus(newStatus);
            onStatusChange?.(car.id, newStatus);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                console.error("BACKEND ERROR:", err.response?.data);
            } else {
                console.error("UNKNOWN ERROR:", err);
            }
            alert("Error updating status");
        }
    };


    const handleDelete = async () => {
        if(!user?.token) return
        try {
            await venueService.delete(car.id, {accessToken:user.token});
            onDelete?.(car.id);
        } catch {
            alert("Error deleting car");
        }
    };

    return (
        <div className={styles.wrapper}>
            {error && <p className={styles.error}>{error}</p>}
            <table className={styles.table}>
                <thead>
                <tr>
                    <th>Brand</th>
                    <th>Model</th>
                    <th>Year</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                    <th>Stats</th>
                    <th>Region Avg Price</th>
                    <th>Country Avg Price</th>
                </tr>
                </thead>
                <tbody>
                <tr key={car.id} className={styles.tableRow}>
                    <td className={styles.user}>{car.brand}</td>
                    <td className={styles.user}>{car.model}</td>
                    <td className={styles.user}>{car.year}</td>
                    <td className={styles.user}>{car.price}</td>
                    <td className={status === "active" ? styles.statusActive : styles.statusInactive}>
                        {status}
                    </td>
                    <td className={styles.actions}>
                        <button className={styles.button} onClick={handleStatusChange} disabled={isLocked}>
                            {status === "active" ? "Deactivate" : "Activate"}
                        </button>
                        <Link href={isLocked ? "#" : `/venues/edit/${car.id}`} passHref>
                            <button
                                className={styles.editButton}
                                onClick={(e) => {
                                    if (isLocked) e.preventDefault();
                                }}
                                disabled={isLocked}
                            >
                                Edit
                            </button>
                        </Link>

                        <button onClick={handleDelete} className={styles.deleteButton}>Delete</button>
                        {isLocked && (
                            <p style={{color: "red", marginTop: 4, fontSize: 10}}>
                                Locked!
                            </p>
                        )}
                    </td>
                    <td className={styles.user}>
                        {activeUser? (
                            stats ? (
                                <>
                                    <p>Views: {stats.total_views}</p>
                                    <p>Daily: {stats.daily_views}</p>
                                    <p>Weekly: {stats.weekly_views}</p>
                                    <p>Monthly: {stats.monthly_views}</p>
                                </>
                            ) : (
                                <p>Loading stats...</p>
                            )
                        ) : (
                            <p>Premium required</p>
                        )}
                    </td>
                    <td className={styles.user}>
                        {activeUser? (
                            regionAvgPrice ? (
                                <>
                                    <p>USD: {regionAvgPrice.USD}</p>
                                    <p>EUR: {regionAvgPrice.EUR}</p>
                                    <p>UAH: {regionAvgPrice.UAH}</p>
                                </>
                            ) : (
                                <p>Loading region prices...</p>
                            )
                        ) : (
                            <p>Premium required</p>
                        )}
                    </td>
                    <td className={styles.user}>
                        {activeUser? (
                            countryAvgPrice ? (
                                <>
                                    <p>USD: {countryAvgPrice.USD}</p>
                                    <p>EUR: {countryAvgPrice.EUR}</p>
                                    <p>UAH: {countryAvgPrice.UAH}</p>
                                </>
                            ) : (
                                <p>Loading country prices...</p>
                            )
                        ) : (
                            <p>Premium required</p>
                        )}
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    );
};

export default VenueListingComponent;
