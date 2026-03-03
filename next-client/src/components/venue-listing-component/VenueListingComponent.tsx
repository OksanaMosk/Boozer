"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import venueService from "@/lib/services/venueService";
import {IVenueWithId} from "@/models/IVenue";
import { useUser } from "@/app/contexts/UserProvider";
import styles from "./VenueListingComponent.module.css";
import {useRouter} from "next/navigation";

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
    const [stats, setStats] = useState<VenueStats | null>(null);
    const isLocked = (venue.edit_attempts ?? 0) >= 3;
    const router = useRouter();

    useEffect(() => {
        if (!user) return;

        (async () => {
            try {
                const statsRes = await venueService.stats.getStats(venue.id);
                setStats(statsRes.data);
            } catch {
                console.log("Error loading stats and prices");
            }
        })();
    }, [venue.id, venue.city, user]);

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
            if (axios.isAxiosError(err)) {
                console.error("BACKEND ERROR:", err.response?.data);
            } else {
                console.error("UNKNOWN ERROR:", err);
            }

            alert("Error updating status");
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
        <>
            <tr
                key={venue.id}
                className={styles.tableRow}
                onClick={goToInfo}
            >
                <td className={styles.tableRowTitle}>{venue.id}</td>
                <td className={styles.tableRowTitle}>{venue.name}</td>
                <td className={styles.tableRowTitle}>
                    <img
                        src={getPhotoUrl(mainPhoto?.photo)}
                        alt={`${venue.name} ${venue.city}`}
                        width={280}
                        height={300}
                        className={styles.venuePoster}
                    />
                </td>
                <td>{venue.city}</td>
                <td>{venue.country}</td>

                <td
                    className={
                        status === "active"
                            ? styles.statusActive
                            : styles.statusInactive
                    }
                >
                    {status}
                </td>

                <td className={styles.a}>
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
                </td>

                <td className={styles.a}>
                    <div className={styles.actions}>

                        <Link
                            href={`/venue-admin/venues/${venue.id}/menu/`}
                            className={styles.buttonLink}
                            onClick={(e) => e.stopPropagation()}
                        >
                            Menu
                        </Link>
                        <Link
                            href={`/venue-admin/venues/${venue.id}/tables/`}
                            className={styles.buttonLink}
                            onClick={(e) => e.stopPropagation()}
                        >
                            Tables
                        </Link>
                        <Link
                            href={`/venue-admin/venues/${venue.id}/travel-extra-services/`}
                            className={styles.buttonLink}
                            onClick={(e) => e.stopPropagation()}
                        >
                            Services
                        </Link>
                        <Link
                            href={`/venue-admin/venues/${venue.id}/orders/`}
                            className={styles.buttonLink}
                            onClick={(e) => e.stopPropagation()}
                        >
                            Orders
                        </Link>
                        <Link
                            href={`/venue-admin/venues/${venue.id}/news/`}
                            className={styles.buttonLink}
                            onClick={(e) => e.stopPropagation()}
                        >
                            News
                        </Link>
                        <Link
                            href={`/venue-admin/venues/${venue.id}/reviews/`}
                            className={styles.buttonLink}
                            onClick={(e) => e.stopPropagation()}
                        >
                            Reviews
                        </Link>
                    </div>
                </td>


            <td>
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
            </td>
          </tr>
    </>
  );
};

export default VenueListingComponent;
