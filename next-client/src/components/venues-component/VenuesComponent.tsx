'use client';

import React, {useEffect, useState} from 'react';
import Link from "next/link";
import {IVenue} from "@/models/IVenue";
import VenueComponent from "@/components/venue-component/VenueComponent";
import {PaginationComponent} from "@/components/pagination-component/PaginationComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import styles from "./VenuesComponent.module.css";
import {AddToFavoriteModalComponent} from "@/components/add-toFavorite-modal-component/AddToFavoriteModalComponent";
import {useUser} from "@/app/contexts/UserProvider";
import {HeartIcon} from "@/components/HeartIcon";
import venueServices from "@/lib/services/venueService";

interface VenuesComponentProps {
    venues: IVenue[];
    totalPages: number;
    isUnauthorized?: boolean;
}

const VenuesComponent: React.FC<VenuesComponentProps> = ({venues, totalPages, isUnauthorized}) => {
    const isFetchingRef = React.useRef(false);
    const [selectedVenueId, setSelectedVenueId] = useState<string | number | null>(null);
    const [userCollections, setUserCollections] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState<Record<string | number, boolean>>({});
    const {user} = useUser();
    const [favoriteStates, setFavoriteStates] = useState<Record<string | number, boolean>>(() =>
        Object.fromEntries(venues.map(v => [v.id!, !!v.is_favorite]))
    );
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setFavoriteStates(Object.fromEntries(venues.map(v => [v.id!, !!v.is_favorite])));
    }, [venues]);

    useEffect(() => {
        const fetchCollections = async () => {
            if (!user?.token || isFetchingRef.current || userCollections.length > 0) return;
            try {
                isFetchingRef.current = true;
                const res = await venueServices.collections({accessToken: user.token}).getAll();
                setUserCollections(res.data.data || res.data || []);
            } catch (e) {
                isFetchingRef.current = false;
            }
        };
        void fetchCollections();

    }, [user?.token, userCollections.length]);
    useEffect(() => {
        const sync = (e: any) => {
            const {venueId} = e.detail;
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

    const handleSuccess = (id: string | number) => {
        setFavoriteStates(prev => ({...prev, [id]: true}));
        setSelectedVenueId(null);
        window.dispatchEvent(new CustomEvent('venue_favorited', {
            detail: {venueId: id}
        }));
    };
     const handleToggleFavorite = async (e: React.MouseEvent, id: string | number) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user?.token || isProcessing[id]) return;
        const isFavorite = favoriteStates[id];
        const auth = {accessToken: user.token};

        if (isFavorite) {
            setIsProcessing(prev => ({...prev, [id]: true}));
            try {
                const privateCols = userCollections.filter(col =>
                    !col.is_staff_top && col.venues?.some((v: any) => v.id === id)
                );

                if (privateCols.length > 0) {
                    await Promise.all(
                        privateCols.map(col =>
                            venueServices.collections(auth).removeVenue(col.id, id)
                        )
                    );
                } else {

                    await venueServices.venues.favorites(auth)(String(id)).delete();
                }

                setFavoriteStates(prev => ({...prev, [id]: false}));
                window.dispatchEvent(new CustomEvent('venue_unfavorited', {
                    detail: {venueId: id}
                }));
            } catch (error: any) {
                if (error.response?.status === 404) {
                    setFavoriteStates(prev => ({...prev, [id]: false}));
                }
            } finally {
                setIsProcessing(prev => ({...prev, [id]: false}));
            }
        } else {
            setSelectedVenueId(id);
        }
    };

    return (
        <div className={styles.venuesListContainer}>
            {mounted && (!user?.token || isUnauthorized) && (
                <div className={styles.authBanner}>
                    <p className={styles.titleGuest}>
                        You are a guest. Please <Link href="/login" className={styles.loginLink}>Sign In</Link> to find venues near you, save them, and see your favorite marks.
                    </p>
                </div>
            )}
            <ul className={styles.list}>
                {/*{venues.filter(venue => venue.status === 'active').map((venue) => (*/}
                {venues.map((venue) => (
                    <li key={venue.id} className={styles.item}>
                        <button
                            className={styles.heartBtn}
                            onClick={(e) => handleToggleFavorite(e, venue.id!)}
                            aria-label={favoriteStates[venue.id!] ? "Remove from favorites" : "Add to favorites"}
                        >
                            <HeartIcon filled={mounted ? favoriteStates[venue.id!] : !!venue.is_favorite}/>
                        </button>
                        {selectedVenueId === venue.id && (
                            <AddToFavoriteModalComponent
                                venueId={venue.id!}
                                token={user?.token}
                                onClose={() => setSelectedVenueId(null)}
                                onSuccess={() => handleSuccess(venue.id!)}
                                initialCollections={userCollections}
                                onCollectionsUpdate={setUserCollections}
                            />
                        )}

                        <Link
                            href={`/venues/${venue.id}`}
                            className={styles.link}
                        >
                            <VenueComponent venue={venue}/>
                        </Link>
                    </li>
                ))}
            </ul>
           {totalPages > 1 && (
                <div className={styles.paginationWrapper}>
                    <PaginationComponent totalPages={totalPages}/>
                </div>
            )}
            <ButtonScrollTopComponent/>
        </div>
    );
};

export default VenuesComponent;





