"use client";

import React, {useEffect, useState} from "react";
import {useUser} from "@/app/contexts/UserProvider";
import userService from "@/lib/services/userService";
import {IVenueWithId} from "@/models/IVenue";
import VenueListingComponent from "@/components/venue-listing-component/VenueListingComponent";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import ProfileComponent from "@/components/profile-component/ProfileComponent";
import Link from "next/link";
import styles from "./DashboardComponent.module.css";
import ChatComponent from "@/components/chat-component/ChatComponent";
import AdminUserManagementComponent from "@/components/admin-user-management-component/AdminUserManagementComponent";
import {getCurrentLevelDiscount, getNextLevelDiscount} from "@/lib/services/getCurrentLevelDiscount";
import venueServices from "@/lib/services/venueService";
import {useDashboardTabs} from "@/hooks/useDashboardTabs";

const DashboardComponent: React.FC = () => {
    const {user, loading: userLoading} = useUser();
    const [venues, setVenues] = useState<IVenueWithId[]>([]);
    const [venuesLoading, setVenuesLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reviewCount, setReviewCount] = useState(0);
    const currentLevel = getCurrentLevelDiscount(reviewCount);
    const nextLevel = getNextLevelDiscount(reviewCount);
    const {activeTab, setTab} = useDashboardTabs();
    const isVenueAdmin = user?.role === "venue_admin";
    const isVisitor = user?.role === "visitor" && user?.profile?.name?.toLowerCase().includes("critic");
    const isAdmin = user?.role === "admin";

    const handleApiError = (err: any) => {
        if (err?.message === "Please log in" || err?.status === 401) {
            setError("Your session expired. Please log in again.");
        } else {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        }
    };
    useEffect(() => {
        if (!user?.id || !isVenueAdmin || activeTab !== "venues_control") return;
        const loadVenues = async () => {
            try {
                setVenuesLoading(true);
                const response = await userService.getUserVenues(String(user.id), {accessToken: user.token!});
                setVenues(response.venues.map((v) => ({...v, id: v.id!})));
            } catch (err) {
                setVenues([]);
                handleApiError(err);
            } finally {
                setVenuesLoading(false);
            }
        };
        void loadVenues();
    }, [user?.id, activeTab, isVenueAdmin, user?.token]);

    const handleDelete = (venueId: string) => {
        setVenues((prev) => prev.filter((v) => v.id !== venueId));
        alert('Venue deleted successfully');
    };

    useEffect(() => {
        if (!user?.id) return;

        const loadReviewStats = async () => {
            try {
                const response = await venueServices.reviews.getAllWithFilter(
                    {user: user.id},
                    {accessToken: user.token!}
                );
                const count = Array.isArray(response.data)
                    ? response.data.length
                    : (response.data as any).count || 0;

                setReviewCount(count);
            } catch (err) {
                handleApiError(err);
            }
        };
        void loadReviewStats();
    }, [user?.id]);


    if (userLoading) return <div className={styles.loaderWrapper}><LoaderComponent/></div>;
    if (!user) return <p className={styles.titleLog}>Please log in to access your dashboard.</p>;

    const DashboardActions = (
        <div className={styles.actionsProfile}>
            <Link href="/profile-edit" className={styles.outline}>Edit Profile</Link>
            {isVenueAdmin && (
                <Link href="/venue-admin/create-venue" className={styles.primary}>+ Add New Venue</Link>
            )}
        </div>
    );

    const dashboardStats = isVenueAdmin
        ? [{label: "My Venues", value: venues.length}, {label: "Total Views", value: "1.2k"}]
        : [{label: "Favorites", value: "8"}, {label: "Reviews", value: "3"}];

    return (
        <div className={styles.wrapper}>

            {error && <p className={styles.errorTitle}>{error}</p>}
            <div className={styles.tabNavigation}>
                <button
                    onClick={() => setTab("profile")}
                    className={`${styles.navButton} ${activeTab === "profile" ? styles.activeTab : ""}`}
                >
                    <span>My Profile</span>
                </button>
                {isVenueAdmin && (
                    <button
                        onClick={() => setTab("venues_control")}
                        className={`${styles.navButton} ${activeTab === "venues_control" ? styles.activeTab : ""}`}
                    >
                        <span>My Venues</span>
                    </button>
                )}

                {isAdmin && (
                    <button
                        onClick={() => setTab("users_control")}
                        className={`${styles.navButton} ${activeTab === "users_control" ? styles.activeTab : ""}`}
                    >
                        <span>Users</span>
                    </button>
                )}
                <button
                    onClick={() => setTab("favorites")}
                    className={`${styles.navButton} ${activeTab === "favorites" ? styles.activeTab : ""}`}
                >
                    <span> My Favorites</span>
                </button>
                <button
                    onClick={() => setTab("my_activity")}
                    className={`${styles.navButton} ${activeTab === "my_activity" ? styles.activeTab : ""}`}
                >
                    <span>My Orders & Activity</span>
                </button>

            </div>

            <div className={styles.mainContent}>
                {activeTab === "favorites" && (
                    <section className={styles.section}>
                        <h2>Favorite Places</h2>
                        <p>Manage saved venues here.</p>

                    </section>
                )}
                {activeTab === "profile" && (
                    <div className={styles.profileSection}>
                        <ProfileComponent
                            user={user}
                            stats={[
                                ...dashboardStats,
                                {label: "Loyalty Level", value: currentLevel.label},
                                {
                                    label: "Your Discount",
                                    value: currentLevel.discount > 0 ? `${currentLevel.discount}%` : "None"
                                }
                            ]}
                            actions={DashboardActions}
                        />

                        {nextLevel && (
                            <div className={styles.loyaltyProgress}>
                                <p>
                                    Write <strong>{nextLevel.minReviews - reviewCount}</strong> more reviews
                                    to unlock a <strong>{nextLevel.discount}%</strong> discount!
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "my_activity" && (
                    <section className={styles.section}>
                        <div className={styles.headerWithBadge}>
                            <h2>{isVisitor ? "Critic's Column" : "Orders & Activity"}</h2>
                            <span className={styles.badge}>{currentLevel.label}</span>
                        </div>
                        <p className={styles.discountInfo}>
                            {currentLevel.discount > 0
                                ? `You have a personal ${currentLevel.discount}% discount for your activity.`
                                : "Keep sharing your feedback to earn exclusive discounts!"}
                        </p>
                        <div className={styles.ordersContainer}>
                            <h3>Recent Orders</h3>
                            <p>Orders map.....</p>
                        </div>
                    </section>
                )}
                {isVenueAdmin && activeTab === "venues_control" && (
                    <section className={styles.section}>
                        <h2>Manage Venue Listings</h2>
                        <div className={styles.table}>
                            {venuesLoading ? (
                                <LoaderComponent/>
                            ) : venues.length > 0 ? (
                                venues.map((venue) => (
                                    <div key={venue.id} className={styles.venueRow}>
                                        <VenueListingComponent
                                            venue={venue}
                                            onDelete={handleDelete}
                                            onStatusChange={() => {
                                            }}
                                        />
                                    </div>
                                ))
                            ) : (
                                <p>You haven't added any venues yet.</p>
                            )}
                        </div>
                    </section>
                )}

            </div>

            {isAdmin && activeTab === "users_control" && (
                <section className={styles.section}>
                    <AdminUserManagementComponent
                        activeTab={activeTab}
                        setGlobalError={(msg) => {
                            setError(msg);
                            setTab("profile");
                        }}
                    />
                </section>
            )}
            {user && (
                <div className={styles.chatWrapper}>
                    <h3 style={{margin: "40px auto", textAlign: "center", width: "fit-content"}}></h3>
                    {user?.id && (
                        <ChatComponent ownerId={String(user.id)}/>
                    )}

                </div>
            )}
        </div>

    );
};

export default DashboardComponent;

