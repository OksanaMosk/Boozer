'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from "next/link";
import { useUser } from "@/app/contexts/UserProvider";
import { useDashboardTabs } from "@/hooks/useDashboardTabs";
import userService from "@/lib/services/userService";
import venueServices from "@/lib/services/venueService";
import { IVenue } from "@/models/IVenue";

import ProfileComponent from "@/components/profile-component/ProfileComponent";
import { FavoriteManagerComponent } from "@/components/favorite-manager-component/FavoriteManagerComponent";
import VenueListingComponent from "@/components/venue-listing-component/VenueListingComponent";
import AdminUserManagementComponent from "@/components/admin-user-management-component/AdminUserManagementComponent";
import { getCurrentLevelDiscount, getNextLevelDiscount } from "@/lib/services/getCurrentLevelDiscount";
import styles from "./DashboardComponent.module.css";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import {TopListManagerComponent} from "@/components/top-list-manager-component/TopListManagerComponent";
import {OrdersVisitorComponent} from "@/components/orders-visitor-component/OrdersVisitorComponent";

interface IVenueWithId extends Omit<IVenue, 'id'> {
    id: string;
}

const DashboardComponent: React.FC = () => {
    const { user, loading: userLoading } = useUser();
    const { activeTab, setTab } = useDashboardTabs();
    const [venues, setVenues] = useState<IVenueWithId[]>([]);
    const [venuesLoading, setVenuesLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reviewCount, setReviewCount] = useState(0);
    const isAdmin = user?.role === "admin";
    const isVenueAdmin = user?.role === "venue_admin";
    const currentLevel = getCurrentLevelDiscount(reviewCount);
    const nextLevel = getNextLevelDiscount(reviewCount);

    const DASHBOARD_TABS = useMemo(() => [
        { id: "profile", label: "My Profile", show: true },
        { id: "favorites", label: "My Favorites", show: true },
        { id: "manage_tops", label: "🎊 Manage Tops", show: isAdmin },
        { id: "venues_control", label: "My Venues", show: isVenueAdmin },
        { id: "users_control", label: "Users", show: isAdmin },
        { id: "my_activity", label: "Orders & Activity", show: true },
    ].filter(tab => tab.show), [isAdmin, isVenueAdmin]);

    const handleApiError = (err: any) => {
        if (err?.status === 401) {
            setError("Your session expired. Please Sign In again.");
        } else {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        }
    };

    useEffect(() => {
        if (!user?.id || !isVenueAdmin || activeTab !== "venues_control") return;
        const loadVenues = async () => {
            try {
                setVenuesLoading(true);
                const response = await userService.getUserVenues(String(user.id), { accessToken: user.token! });
                const mappedVenues = response.venues.map((v: IVenue) => ({ ...v, id: String(v.id) } as IVenueWithId));
                setVenues(mappedVenues);
            } catch (err) {
                setVenues([]);
                handleApiError(err);
            } finally {
                setVenuesLoading(false);
            }
        };
        void loadVenues();
    }, [user?.id, activeTab, isVenueAdmin, user?.token]);

    useEffect(() => {
        if (!user?.id) return;
        const loadReviewStats = async () => {
            try {
                const response = await venueServices.reviews.getAllWithFilter({ user: user.id }, { accessToken: user.token! });
                const count = Array.isArray(response.data) ? response.data.length : (response.data as any).count || 0;
                setReviewCount(count);
            } catch (err) { handleApiError(err); }
        };
        void loadReviewStats();
    }, [user?.id, user?.token]);

    const handleDelete = (venueId: string) => {
        setVenues((prev) => prev.filter((v) => v.id !== venueId));
    };

    if (userLoading) return <div className={styles.loaderWrapper}><LoaderComponent/></div>;
    if (!user) return <p className={styles.titleLog}>Please Sign In to access your dashboard.</p>;

    const dashboardStats = isVenueAdmin
        ? [{label: "My Venues", value: venues.length}, {label: "Total Views", value: "1.2k"}]
        : [{label: "Reviews", value: reviewCount}, {label: "Discount", value: `${currentLevel.discount}%`}];

    return (
        <div className={styles.wrapper}>
            {error && <p className={styles.errorTitle}>{error}</p>}
            <div className={styles.tabNavigation}>
                {DASHBOARD_TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setTab(tab.id as any)}
                        className={`${styles.navButton} ${activeTab === tab.id ? styles.activeTab : ""}`}
                    >
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className={styles.mainContent}>
                {activeTab === "favorites" && (
                    <section className={styles.section}>
                        <FavoriteManagerComponent
                            userId={String(user.id)}
                        />
                    </section>
                )}

                {activeTab === "manage_tops" && isAdmin && (
                    <section className={styles.section}>
                        <TopListManagerComponent
                            userId={String(user.id)}
                        />
                    </section>
                )}

                {activeTab === "profile" && (
                    <div className={styles.profileSection}>
                        {nextLevel && (
                            <div className={styles.loyaltyProgress}>
                                <p>Write <strong>{nextLevel.minReviews - reviewCount}</strong> more reviews to
                                    unlock <strong>{nextLevel.discount}%</strong>!</p>
                            </div>
                        )}
                        <ProfileComponent
                            user={user}
                            stats={[
                                ...dashboardStats,
                                {label: "Loyalty Level", value: currentLevel.label}
                            ]}
                            actions={
                                <div className={styles.actionsProfile}>
                                    {!isAdmin &&
                                        <Link href="/profile-edit" className={styles.outline}>Edit Profile</Link>}
                                    {isVenueAdmin &&
                                        <Link href="/venue-admin/create-venue" className={styles.primary}>+ Add
                                            Venue</Link>}
                                </div>
                            }
                        />
                    </div>
                )}
                {isVenueAdmin && activeTab === "venues_control" && (
                    <section className={styles.section}>
                        <h2 className={styles.titleManage}>Manage Venue Listings</h2>
                        <div className={styles.table}>
                            {venuesLoading ? <LoaderComponent/> : venues.length > 0 ? (
                                venues.map((v) =>
                                    <VenueListingComponent
                                        key={v.id} venue={v}
                                        onDelete={() =>
                                            handleDelete(v.id)}
                                    />)
                            ) : <p>No venues added yet.</p>
                            }
                        </div>
                    </section>
                )}

                {isAdmin && activeTab === "users_control" && (
                    <AdminUserManagementComponent
                        activeTab={activeTab}
                        setGlobalError={(msg) => {
                            setError(msg);
                            setTab("profile");
                        }}
                    />
                )}
                {activeTab === "my_activity" && (
                    <section className={styles.section}>
                        <h2  className={styles.titleManage}>Orders & Activity</h2>
                       <OrdersVisitorComponent/>
                    </section>
                )}
            </div>

        </div>
    );
};

export default DashboardComponent;