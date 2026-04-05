"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import VenueComponent from "@/components/venue-component/VenueComponent";
import venueServices from "@/lib/services/venueService";
import { useUser } from "@/app/contexts/UserProvider";
import { HeartIcon } from "@/components/HeartIcon";
import { AddToFavoriteModalComponent } from "@/components/add-toFavorite-modal-component/AddToFavoriteModalComponent";
import styles from "./TopStaffListComponent.module.css";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";

const TopStaffListComponent: React.FC = () => {
    const { user } = useUser();
    const isFetchingRef = useRef(false);
    const [collections, setCollections] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [userCollections, setUserCollections] = useState<any[]>([]);
    const [selectedVenueId, setSelectedVenueId] = useState<string | number | null>(null);
    const [favoriteStates, setFavoriteStates] = useState<Record<string | number, boolean>>({});
    const [isProcessing, setIsProcessing] = useState<Record<string | number, boolean>>({});
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);


    useEffect(() => {
        isFetchingRef.current = false;
        const fetchInitialData = async () => {
              if (isFetchingRef.current) return;
            try {
                isFetchingRef.current = true;
                setError(false);
                setLoading(true);
                const auth = user?.token ? {accessToken: user.token} : undefined;
                const [staffRes, userColRes] = await Promise.all([
                    venueServices.collections(auth).staffTop(),
                    user?.token
                        ? venueServices.collections(auth).getAll()
                        : (async () => ({data: {data: []} as any}))()
                ]);
                const filtered = staffRes.data.filter((col: any) => col.is_staff_top === true);
                const userCols = userColRes.data?.data || userColRes.data || [];
                const favoriteIds = new Set();
                userCols.forEach((col: any) => col.venues?.forEach((v: any) => favoriteIds.add(v.id)));
                const initialFavorites: Record<string | number, boolean> = {};
                filtered.forEach((col: any) => {
                    col.venues?.forEach((v: any) => {
                        initialFavorites[v.id] = favoriteIds.has(v.id) || !!v.is_favorite;
                    });
                });
                setCollections(filtered);
                setUserCollections(userCols);
                setFavoriteStates(initialFavorites);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
                isFetchingRef.current = false;
            }
        };
        void fetchInitialData();
    }, [user?.token]);

    useEffect(() => {
        const sync = (e: any) => {
            const { venueId } = e.detail;
            setFavoriteStates(prev => ({
                ...prev,
                [venueId]: e.type === 'venue_favorited'
            }));
        };
        window.addEventListener('venue_favorited', sync);
        window.addEventListener('venue_unfavorited', sync);
        return () => {
            window.removeEventListener('venue_favorited', sync);
            window.removeEventListener('venue_unfavorited', sync);
        };
    }, []);
     const handleToggleFavorite = async (e: React.MouseEvent, id: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user?.token || isProcessing[id]) return;
    if (favoriteStates[id]) {
        setIsProcessing(prev => ({ ...prev, [id]: true }));
        try {
            const auth = { accessToken: user.token };
            const privateCollectionsWithVenue = userCollections.filter(col =>
                !col.is_staff_top && col.venues?.some((v: any) => v.id === id)
            );
            if (privateCollectionsWithVenue.length > 0) {
                await Promise.all(
                    privateCollectionsWithVenue.map(col =>
                        venueServices.collections(auth).removeVenue(col.id, id)
                    )
                );
            } else {
                await venueServices.venues.favorites(auth)(String(id)).delete();
            }
            setFavoriteStates(prev => ({ ...prev, [id]: false }));
            setUserCollections(prev => prev.map(col => {
                if (col.is_staff_top) return col;
                return {
                    ...col,
                    venues: col.venues ? col.venues.filter((v: any) => v.id !== id) : []
                };
            }));
            window.dispatchEvent(new CustomEvent('venue_unfavorited', { detail: { venueId: id } }));
        } catch {
            setFavoriteStates(prev => ({ ...prev, [id]: false }));
        } finally {
            setIsProcessing(prev => ({ ...prev, [id]: false }));
        }
    } else {
        setSelectedVenueId(id);
    }
     };

    if (loading) return <div className={styles.loaderWrapper}><LoaderComponent/></div>;
    if (error || (collections.length === 0 && !loading)) return null;

    const visibleCollections = collections.filter(col => col.venues && col.venues.length > 0);
    if (visibleCollections.length === 0) return null;
    return (
        <div className={styles.venuesListContainer}>
             {mounted && !user?.token && (
            <div className={styles.authBanner}>
                <p className={styles.titleGuest}>
                    You are a guest. Please <Link href="/login" className={styles.loginLink}>Sign In</Link> to save venues.
                </p>
            </div>
        )}
            {visibleCollections.map((collection) => (
                <div key={collection.id} className={styles.collectionSection}>
                    <h2 className={styles.categoryTitle}>
                        {collection.name}
                    </h2>
                    <ul className={styles.list}>
                        {collection.venues.map((venue: any) => (
                            <li key={venue.id} className={styles.item}>
                                <button
                                    className={styles.heartBtn}
                                    onClick={(e) => handleToggleFavorite(e, venue.id)}
                                    disabled={isProcessing[venue.id]}
                                >
                                   <HeartIcon filled={favoriteStates[venue.id]} />
                                </button>

                                {selectedVenueId === venue.id && (
                                    <AddToFavoriteModalComponent
                                        venueId={venue.id}
                                        token={user?.token}
                                        onClose={() => setSelectedVenueId(null)}
                                        onSuccess={() => {
                                            setFavoriteStates(prev => ({ ...prev, [venue.id]: true }));
                                            setSelectedVenueId(null);
                                            window.dispatchEvent(new CustomEvent('venue_favorited', { detail: { venueId: venue.id } }));
                                        }}
                                        initialCollections={userCollections}
                                        onCollectionsUpdate={setUserCollections}
                                    />
                                )}

                                <Link href={`/venues/${venue.id}`} className={styles.link}>
                                    <VenueComponent venue={venue} />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default TopStaffListComponent;
