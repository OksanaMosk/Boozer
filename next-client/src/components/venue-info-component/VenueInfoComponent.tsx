"use client";

import React, { useEffect, useRef, useMemo, useState } from "react";
import Link from "next/link";
import { IVenue } from "@/models/IVenue";
import ChatComponent from "../chat-component/ChatComponent";
import styles from "./VenueInfoComponent.module.css";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import {HeartIcon} from "@/components/HeartIcon";
import {AddToFavoriteModalComponent} from "@/components/add-toFavorite-modal-component/AddToFavoriteModalComponent";
import {useUser} from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";

interface Props {
    venue: IVenue;
}

const VenueInfoComponent: React.FC<Props> = ({venue}) => {
    const [userCollections, setUserCollections] = useState<any[]>([]);
    const footerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isFavorite, setIsFavorite] = useState(!!venue.is_favorite);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isUnauthorized, setIsUnauthorized] = useState(false);
    const {user} = useUser();

    useEffect(() => {
        setMounted(true);
        setIsFavorite(!!venue.is_favorite);
        setIsUnauthorized(false);
        if (user?.token) {
            const auth = {accessToken: user.token};
            const checkFavoriteStatus = async () => {
                try {
                    const res = await venueServices.venues.favorites(auth)(String(venue.id)).getAll();
                    const favorites = res.data?.data || res.data || [];
                    const exists = Array.isArray(favorites)
                        ? favorites.some(fav => fav.is_staff_top === false)
                        : (favorites.id && favorites.is_staff_top === false);
                    setIsFavorite(!!exists);
                } catch (error: any) {
                    if (error.message === "Please Sign In") {
                        setIsUnauthorized(true);
                    }
                }
            };
            void checkFavoriteStatus();
        }
    }, [venue.id, user?.token]);

    useEffect(() => {
        const fetchCollections = async () => {
            if (!user?.token) return
            try {
                const res = await venueServices.collections({accessToken: user.token}).getAll();
                setUserCollections(res.data.data || res.data || []);
            } catch (e) {
            }
        };
        void fetchCollections();

    }, [user?.token]);
    useEffect(() => {
        const sync = (e: any) => {
            if (String(e.detail.venueId) === String(venue.id)) {
                setIsFavorite(e.type === 'venue_favorited');
            }
        };
        window.addEventListener('venue_favorited', sync);
        window.addEventListener('venue_unfavorited', sync);
        return () => {
            window.removeEventListener('venue_favorited', sync);
            window.removeEventListener('venue_unfavorited', sync);
        };
    }, [venue.id]);

    const handleToggleFavorite = async () => {
        if (!user?.token || isProcessing) return;
        const auth = {accessToken: user.token};

        if (isFavorite) {
            setIsProcessing(true);
            try {
                const privateCols = userCollections.filter(col =>
                    !col.is_staff_top && col.venues?.some((v: any) => v.id === venue.id)
                );
                if (privateCols.length > 0) {
                    await Promise.all(privateCols.map(col =>
                        venueServices.collections(auth).removeVenue(col.id, venue.id!)
                    ));
                } else {
                    await venueServices.venues.favorites(auth)(String(venue.id)).delete();
                }
                setIsFavorite(false);
                setUserCollections(prev => prev.map(col => {
                    if (col.is_staff_top) return col;
                    return {
                        ...col,
                        venues: col.venues ? col.venues.filter((v: any) => v.id !== venue.id) : []
                    };
                }));

                window.dispatchEvent(new CustomEvent('venue_unfavorited', {detail: {venueId: venue.id}}));
            } catch (error: any) {
                if (error.response?.status === 404) setIsFavorite(false);
            } finally {
                setIsProcessing(false);
            }
        } else {
            setShowModal(true);
        }
    };

    const handleSuccess = () => {
        setIsFavorite(true);
        setShowModal(false);
        window.dispatchEvent(new CustomEvent('venue_favorited', {detail: {venueId: venue.id}}));
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            {threshold: 0.2}
        );

        if (footerRef.current) {
            observer.observe(footerRef.current);
        }

        return () => {
            if (footerRef.current) {
                observer.unobserve(footerRef.current);
            }
        };
    }, []);

    const photos = venue.photos ?? [];

    const mainPhoto = useMemo(() => {
        return photos.find(p => p.is_main) || photos[0] || null;
    }, [photos]);

    const [currentIndex, setCurrentIndex] = useState(
        mainPhoto ? photos.findIndex(p => p.id === mainPhoto.id) : 0
    );

    const prevPhoto = () => {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
    };

    const nextPhoto = () => {
        setCurrentIndex(prev => Math.min(prev + 1, photos.length - 1));
    };

    const currentPhoto = photos[currentIndex];

    return (
        <div>
            <div className={styles.container}>
                <div className={styles.mainContainer}>
                    <div className={styles.photoContainer}>
                        <div className={styles.buttonGoBack}><ButtonGoBackComponent/></div>
                       {mounted && (!user?.token  || isUnauthorized) && (
                            <div className={styles.authBanner}>
                                <p className={styles.titleGuest}>
                                    You are a guest. <Link href="/login" className={styles.loginLink}>Sign In</Link> to
                                    save
                                    this venue.
                                </p>
                            </div>
                        )}
                        <button
                            className={styles.heartBtn}
                            onClick={handleToggleFavorite}
                            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                            <HeartIcon filled={mounted ? isFavorite : !!venue.is_favorite}/>
                        </button>
                        {showModal && (
                            <AddToFavoriteModalComponent
                                venueId={venue.id!}
                                token={user?.token}
                                onClose={() => setShowModal(false)}
                                onSuccess={handleSuccess}
                                initialCollections={userCollections}
                                onCollectionsUpdate={setUserCollections}
                            />
                        )}
                        {mainPhoto ? (
                            <img
                                src={mainPhoto.photo}
                                alt={venue.name}
                                width={500}
                                height={400}
                                className={styles.venuePoster}
                            />
                        ) : (
                            <div className={styles.noPoster}>
                                <img
                                    src="/images/noPosterVenue.webp"
                                    alt="No poster"
                                    width={500}
                                    height={400}
                                    className={styles.placeholder}
                                />
                            </div>
                        )}</div>

                    <div className={styles.content}>
                        <div className={styles.contentHero}>
                            <h2 className={styles.title}>
                                Welcome to {venue.name} in {venue.city}
                            </h2>
                                <p className={`${styles.overallLabel} ${!(venue.rating !== undefined && venue.rating > 0) ? styles.hidden : ''}`}>
                                ✸ {venue.rating}</p>
                            {venue.tags && venue.tags.length > 0 && (
                                <div className={styles.tagsWrapper}>
                                    {venue.tags.map((tag) => (
                                        <Link
                                            key={tag.id}
                                            href={`/venues?tags=${tag.name}`}
                                            className={styles.tagBadge}
                                        >
                                            #{tag.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                            <Link href={`/venues/${venue.id}/reviews`} className={styles.reviewsBtn}>
                                Reviews
                            </Link>

                            {venue.description && (
                                <p className={styles.overview}>
                                    {venue.description}
                                </p>
                            )}
                        </div>
                        <div>
                            {photos[1]?.photo ? (
                                <img
                                    src={photos[1].photo}
                                    alt={venue.name}
                                    width={300}
                                    height={380}
                                    className={styles.venuePoster2}
                                />
                            ) : (
                                <img
                                    src="/images/noPosterVenue.webp"
                                    alt="No poster"
                                    width={300}
                                    height={380}
                                    className={styles.venuePoster2}
                                />
                            )}
                        </div>
                    </div>

                    <div className={styles.contentNews}>
                        <div>
                            {photos[2]?.photo ? (
                                <img
                                    src={photos[2].photo}
                                    alt={venue.name}
                                    width={300}
                                    height={380}
                                    className={styles.venuePoster2}
                                />
                            ) : (
                                <img
                                    src="/images/noPosterVenue.webp"
                                    alt="No poster"
                                    width={300}
                                    height={380}
                                    className={styles.venuePoster2}
                                />
                            )}
                        </div>
                        <div className={styles.contentHero}>
                            {venue.id && (
                                <Link
                                    href={`/venues/${venue.id}/news/`}
                                    className={styles.titleMenu}
                                >
                                    What’s New
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className={styles.contentNews}>
                        <div className={styles.contentHero}>
                            {venue.id && (
                                <Link
                                    href={`/venues/${venue.id}/menu/`}
                                    className={styles.titleMenu}
                                >
                                    Our Menu
                                </Link>
                            )}
                        </div>
                        <div>
                            {photos[3]?.photo ? (
                                <img
                                    src={photos[3].photo}
                                    alt={venue.name}
                                    width={300}
                                    height={380}
                                    className={styles.venuePoster2}
                                />
                            ) : (
                                <img
                                    src="/images/noPosterVenue.webp"
                                    alt="No poster"
                                    width={300}
                                    height={380}
                                    className={styles.venuePoster2}
                                />
                            )}
                        </div>
                    </div>


                    <div className={styles.contentGallery}>

                        {photos.length > 1 && currentPhoto && (
                            <div className={styles.singleGalleryWrapper}>
                                <button
                                    className={styles.arrow}
                                    onClick={prevPhoto}
                                    disabled={currentIndex === 0}
                                >
                                    ←
                                </button>

                                <img
                                    src={currentPhoto.photo}
                                    alt={`Photo ${currentIndex + 1}`}
                                    className={styles.singleThumbnail}
                                />

                                <button
                                    className={styles.arrow}
                                    onClick={nextPhoto}
                                    disabled={currentIndex === photos.length - 1}
                                >
                                    →
                                </button>
                            </div>
                        )}
                    </div>
                    <Link href={`/boozer?venueId=${venue.id}`}>
                        <p className={styles.titleMenu}>Your VIP Boozer status starts here!</p>
                        <img
                            src="/favicon/android-chrome-512x512.png"
                            alt="logo"
                            width={80}
                            height={80}
                            className={styles.logoImage}
                            loading="eager"
                            style={{objectFit: "contain"}}
                        />
                        <p className={styles.titleJoin}>Join now</p>
                    </Link>
                </div>
            </div>

            <div
                ref={footerRef}
                className={`${styles.footerContainer} ${styles.animate} ${
                    isVisible ? styles.visible : ""
                }`}
            >
                <div className={styles.footerSection}>
                    <h3 className={styles.footerTitle}>ADDRESS</h3>
                    <div className={styles.details}>
                        <p className={styles.location}>
                            {venue.country}, {venue.city}
                        </p>
                        {venue.address && <p>{venue.address}</p>}
                        {venue.phone && <p>{venue.phone}</p>}
                    </div>
                </div>

                <div className={styles.footerSection}>
                    <h3 className={styles.footerTitle}>CONTACT US</h3>
                    <p>ID: {venue.id}</p>
                    <div style={{margin: "20px auto", maxWidth: "400px"}}>
                        {venue.id ? (
                            <ChatComponent ownerId={String(venue.id)}/>
                        ) : (
                            <p style={{textAlign: "center"}}>Venue Admin not available</p>
                        )}
                    </div>

                </div>

                <div className={styles.footerSection}>
                    <h3 className={styles.footerTitle}>OPENING HOURS</h3>
                    <div className={styles.open}>
                        {venue.opening_hours && Object.keys(venue.opening_hours).length > 0 ? (
                            <ul className={styles.openList}>
                                {Object.entries(venue.opening_hours).map(([day, hours]) => (
                                    <li key={day}>
                                        {day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()}: {hours.open} - {hours.close}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No opening hours available</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VenueInfoComponent;
