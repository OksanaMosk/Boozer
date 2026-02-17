"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import venueService from "@/lib/services/venueService";
import { IVenue } from "@/models/IVenue";
import { useUser } from "@/app/contexts/UserProvider";
import styles from "./VenueListingComponent.module.css";

interface VenueStats {
  total_views: number;
  daily_views: number;
  weekly_views: number;
  monthly_views: number;
}

interface Props {
  venue: IVenue;
  onDelete?: (id: string) => void;
  onStatusChange?: (venueId: string, status: string) => void;
}

const VenueListingComponent: React.FC<Props> = ({
  venue,
  onDelete,
  onStatusChange,
}) => {
  const { user } = useUser();

  const [status, setStatus] = useState<string>(venue.status || "");
  const [stats, setStats] = useState<VenueStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLocked = (venue.edit_attempts ?? 0) >= 3;

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        setError(null);

        const [statsRes] = await Promise.all([
          venueService.getStats(venue.id),
        ]);

        setStats(statsRes.data);

      } catch {
        setError("Error loading stats and prices");
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
        { status: newStatus },
        { accessToken: user.token }
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

  return (
    <div className={styles.wrapper}>
      {error && <p className={styles.error}>{error}</p>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>City</th>
            <th>Country</th>
            <th>Status</th>
            <th>Actions</th>
            <th>Stats</th>
          </tr>
        </thead>

        <tbody>
          <tr key={venue.id} className={styles.tableRow}>
            <td>{venue.name}</td>
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

            <td className={styles.actions}>
              <button
                className={styles.button}
                onClick={handleStatusChange}
                disabled={isLocked}
              >
                {status === "active" ? "Deactivate" : "Activate"}
              </button>

              <Link href={isLocked ? "#" : `/venues/edit/${venue.id}`}>
                <button
                  className={styles.editButton}
                  disabled={isLocked}
                >
                  Edit
                </button>
              </Link>

              <button
                onClick={handleDelete}
                className={styles.deleteButton}
              >
                Delete
              </button>

              {isLocked && (
                <p style={{ color: "#ef4444", marginTop: 4, fontSize: 10 }}>
                  Locked!
                </p>
              )}
            </td>

            <td>
              {user ? (
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
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default VenueListingComponent;
