"use client";

import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import { useUser } from "@/app/contexts/UserProvider";
import venueService from "@/lib/services/venueService";
import {IVenueWithId} from "@/models/IVenue";
import styles from "./VenueListingComponent.module.css";
import GoldChartComponent from "@/components/gold-chart-component/GoldChartComponent";

interface VenueStats {
  total_views: number;
  daily_views: number;
  weekly_views: number;
  monthly_views: number;
}

interface Props {
    venue: IVenueWithId;
    onDelete?: (id: string) => void;
    onStatusChange?: (venueId: string, status: string) => void;
}

const VenueListingComponent: React.FC<Props> = ({
                                                    venue,
                                                    onDelete,
                                                    onStatusChange,
                                                }) => {
    const {user} = useUser();
    const [status, setStatus] = useState<string>(venue.status || "");
    const isLocked = (venue.edit_attempts ?? 0) >= 3;
    const router = useRouter()

    const handleStatusChange = async () => {
        if (status === "pending") {
            alert("You cannot change status while venue is pending review.");
            return;
        }

        if (!user?.token) return;

        try {
            const newStatus = status === "active" ? "inactive" : "active";

            await venueService.venues.update(
                venue.id,
                {status: newStatus},
                {accessToken: user.token}
            );

            setStatus(newStatus);
            onStatusChange?.(venue.id, newStatus);
        } catch (err) {
                console.error("BACKEND ERROR:", err);

        }
    };

    const handleDelete = async () => {
        if (!user?.token) return;

        try {
            await venueService.venues.delete(venue.id, {
                accessToken: user.token,
            });

            onDelete?.(venue.id);
        } catch {
            alert("Error deleting venue");
        }
    };


    const photos = venue.photos ?? [];
    const mainPhoto = photos.find(p => p.is_main) || photos[0] || null;

    const getPhotoUrl = (photo: string) => {
        if (!photo) return '/images/noPosterVenue.webp';
        return photo.startsWith('http') ? photo : `http://localhost:8888${photo}`;
    };


    const goToInfo = () => {
        if (!isLocked) {
            router.push(`/venues/${venue.id}`);
        }
    };

    return (
        <div className={styles.list}>
            <div
                key={venue.id}
                className={styles.tableRow}
                onClick={goToInfo}
            >
                <div className={styles.tablePhoto}>
                    <img
                        src={getPhotoUrl(mainPhoto?.photo)}
                        alt={`${venue.name} ${venue.city}`}
                        width={380}
                        height={200}
                        className={styles.venuePoster}
                    />
            </div>
                <div className={styles.row} >
                    <div  className={styles.titleBlock}>
                        <div className={styles.info}>
                            <p className={styles.tableRowTitle}>
                                {venue.name}
                                <span
                                    className={`${styles.status} ${
                                        status === "active" ? styles.statusActive : styles.statusInactive
                                    }`}
                                >
                                {status}
                                </span>
                            </p>
                            <p className={styles.address}>({venue.city}, {venue.country})</p>
                        </div>
                        <div className={styles.stats}>
                            <GoldChartComponent/>
                        </div>
                        <div className={styles.a}>
                        <div className={styles.actions}>
                            <button

                                className={styles.button}
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                        await handleStatusChange();
                                    } catch (error) {
                                        console.error(error);
                                    }
                                }}
                                disabled={isLocked}
                            >
                                {status === "active" ? "Deactivate" : "Activate"}
                            </button>
                            <Link href={isLocked ? "#" : `/venue-admin/venues/${venue.id}/edit/`}>
                                <button
                                    className={styles.editButton}
                                    disabled={isLocked}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Edit
                                </button>
                            </Link>

                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    await handleDelete();
                                }}
                                className={styles.deleteButton}
                            >
                                Delete
                            </button>

                            {isLocked && (
                                <p style={{color: "#ef4444", marginTop: 4, fontSize: 10}}>
                                    Locked!
                                </p>
                            )}
                        </div>
                    </div>
                    </div>

                    <div className={styles.bottom}>
                        <div className={styles.actionsLink}>

                            <Link
                                href={`/venue-admin/venues/${venue.id}/menu/`}
                                className={`${styles.buttonLink} ${styles.primary}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                Menu
                            </Link>
                            <Link
                                href={`/venue-admin/venues/${venue.id}/tables/`}
                                className={`${styles.buttonLink} ${styles.primary}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                Tables
                            </Link>
                            <Link
                                href={`/venue-admin/venues/${venue.id}/travel-extra-services/`}
                                className={`${styles.buttonLink} ${styles.primary}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                Services
                            </Link>
                            <Link
                                href={`/venue-admin/venues/${venue.id}/orders/`}
                                className={`${styles.buttonLink} ${styles.outline}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                Orders
                            </Link>
                            <Link
                                href={`/venue-admin/venues/${venue.id}/news/`}
                                className={`${styles.buttonLink} ${styles.outline}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                News
                            </Link>
                            <Link
                                href={`/venue-admin/venues/${venue.id}/reviews/`}
                                className={`${styles.buttonLink} ${styles.outline}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                Reviews
                            </Link>
                            <p>
                                {/*{user ? (*/}
                                {/*  stats ? (*/}
                                {/*    <>*/}
                                {/*      <p>Views: {stats.total_views}</p>*/}
                                {/*      <p>Daily: {stats.daily_views}</p>*/}
                                {/*      <p>Weekly: {stats.weekly_views}</p>*/}
                                {/*      <p>Monthly: {stats.monthly_views}</p>*/}
                                {/*    </>*/}
                                {/*  ) : (*/}
                                {/*    <p>Loading stats...</p>*/}
                                {/*  )*/}
                                {/*) : (*/}
                                {/*  <p>Premium required</p>*/}
                                {/*)}*/}
                            </p>

                        </div>
                        <p className={styles.address}>ID:{venue.id}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VenueListingComponent;
