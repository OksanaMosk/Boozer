"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/app/contexts/UserProvider";
import venueService from "@/lib/services/venueService";
import { IVenueWithId } from "@/models/IVenue";
import styles from "./VenueListingComponent.module.css";
import GoldChartComponent from "@/components/gold-chart-component/GoldChartComponent";

interface Props {
    venue: IVenueWithId;
    onDelete?: (id: string) => void;
    onStatusChange?: (venueId: string, status: string) => void;
}

const VenueListingComponent: React.FC<Props> = ({ venue, onDelete, onStatusChange }) => {
    const { user } = useUser();
    const router = useRouter();
    const [status, setStatus] = useState<string>(venue.status || "");
    const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

    const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
    const isLocked = (venue.edit_attempts ?? 0) >= 3;

    const quickLinks = useMemo(() => [
        { href: 'menu', label: 'Menu', className: styles.primary },
        { href: 'tables', label: 'Tables', className: styles.primary },
        { href: 'travel-extra-services', label: 'Services', className: styles.primary },
        { href: 'orders', label: 'Orders', className: styles.outline },
        { href: 'analytics', label: 'Analytics', className: styles.outline },
        { href: 'news', label: 'News', className: styles.outline },
        { href: 'reviews', label: 'Reviews', className: styles.outline },
    ], []);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleStatusChange = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user?.token) return;

        try {
            let newStatus = "";
            if (status === "pending") {
                if (!isAdmin) {
                    setMessage({ text: "Only admins can approve venues", isError: true });
                    return;
                }
                await venueService.venues.approve(venue.id, { accessToken: user.token });
                newStatus = "active";
                setMessage({ text: "Venue approved!", isError: false });
            } else {
                newStatus = status === "active" ? "inactive" : "active";
                await venueService.venues.update(venue.id, { status: newStatus }, { accessToken: user.token });
                setMessage({ text: `Status: ${newStatus}`, isError: false });
            }
            setStatus(newStatus);
            onStatusChange?.(venue.id, newStatus);
        } catch {
            setMessage({ text: "Action failed", isError: true });
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user?.token) return;
        try {
            await venueService.venues.delete(venue.id, { accessToken: user.token });
            setMessage({ text: "Deleted", isError: false });
            setTimeout(() => onDelete?.(venue.id), 1000);
        } catch {
            setMessage({ text: "Error deleting", isError: true });
        }
    };

    const photoUrl = useMemo(() => {
        const photo = venue.photos?.find(p => p.is_main)?.photo || venue.photos?.[0]?.photo;
        if (!photo) return '/images/noPosterVenue.webp';
        return photo.startsWith('http') ? photo : `http://localhost:8888${photo}`;
    }, [venue.photos]);

    return (
        <div className={styles.list}>
            <div className={styles.tableRow} onClick={() => !isLocked && router.push(`/venues/${venue.id}`)}>
                <div className={styles.tablePhoto}>
                    <img src={photoUrl} alt={venue.name} className={styles.venuePoster} width={380} height={200} />
                </div>

                <div className={styles.row}>
                    <div className={styles.titleBlock}>
                        <div className={styles.info}>
                            <p className={styles.tableRowTitle}>{venue.name}</p>
                            <p className={`${styles.status} ${status === "active" ? styles.statusActive : styles.statusInactive}`}>
                                {status}
                            </p>
                            <p className={styles.address}>({venue.city}, {venue.country})</p>
                        </div>

                        <div className={styles.rightWrapper}>
                            <div className={styles.stats}><GoldChartComponent /></div>

                            <div className={styles.actions}>
                                <button
                                    className={styles.button}
                                    onClick={handleStatusChange}
                                    disabled={isLocked || (status === "pending" && !isAdmin)}
                                >
                                    {status === "pending" ? (isAdmin ? "Approve" : "Pending") : (status === "active" ? "Deactivate" : "Activate")}
                                </button>

                                <Link href={isLocked ? "#" : `/venue-admin/venues/${venue.id}/edit/`}>
                                    <button className={styles.editButton} disabled={isLocked} onClick={e => e.stopPropagation()}>
                                        Edit
                                    </button>
                                </Link>

                                <button className={styles.deleteButton} onClick={handleDelete}>Delete</button>

                                {message && <p className={message.isError ? styles.error : styles.success}>{message.text}</p>}
                                {isLocked && <p className={styles.lockHint}>Locked (Max attempts)</p>}
                            </div>
                        </div>
                    </div>

                    <div className={styles.bottom}>
                        <div className={styles.actionsLink}>
                            {quickLinks.map(link => (
                                <Link
                                    key={link.href}
                                    href={`/venue-admin/venues/${venue.id}/${link.href}/`}
                                    className={`${styles.buttonLink} ${link.className}`}
                                    onClick={e => e.stopPropagation()}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                        <p className={styles.venueId}>ID: {venue.id}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VenueListingComponent;
