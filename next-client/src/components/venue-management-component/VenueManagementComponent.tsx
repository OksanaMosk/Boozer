"use client";

import React, { useEffect, useState} from "react";
import userService from "@/lib/services/userService";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import {IVenueWithId} from "@/models/IVenue";
import styles from "./VenueManagementComponent.module.css";
import VenueListingComponent from "@/components/venue-listing-component/VenueListingComponent";
import {useUser} from "@/app/contexts/UserProvider";
import {PaginationComponent} from "@/components/pagination-component/PaginationComponent";
import {useSearchParams} from "next/navigation";

interface Props {
  userId: string;
}

const VenueManagementComponent: React.FC<Props> = ({userId}) => {
    const [venuesLoading, setVenuesLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [venues, setVenues] = useState<IVenueWithId[]>([]);
    const searchParams= useSearchParams();
    const currentPage = Number(searchParams.get("page") || "1")
    const [totalPages, setTotalPages] = useState(1);
    const {user} = useUser();

    useEffect(() => {
        if (!userId || !user) {
            setError("User ID is missing");
            return;
        }

        const loadVenues = async () => {
            try {
                setVenuesLoading(true);
                 setVenues([]);
                const response = await userService.getUserVenues(
                    String(userId),
                    {accessToken: user.token!},
                    {page: currentPage}
                );

                const responseData = (response as any).data || response;

                if (responseData) {
                    setTotalPages(responseData.total_pages || 1);
                    const venuesArray = responseData.venues || [];
                    setVenues(venuesArray.map((v: any) => ({...v, id: v.id!})));
                }


            } catch (err) {
                setVenues([]);
                setError("Failed to load venues.");
            } finally {
                setVenuesLoading(false);
            }
        };
        void loadVenues();
    }, [userId, user?.token, currentPage]);


    const handleDelete = (venueId: string) => {
        setVenues((prev) => prev.filter((v) => v.id !== venueId));
    };

    if (venuesLoading) return <div style={{display: "flex", justifyContent: "center", marginTop: 50}}>
        <LoaderComponent/>
    </div>;

    if (error) return <p className={styles.errorText}>{error}</p>;

    return (
        <div>
             <div className={styles.paginationWrapper}>
            </div>
            <h2 className={styles.title} >Manage Venue Listings</h2>
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
                    <p className={styles.titleNo}>You haven't added any venues yet.</p>
                )}
            </div>
            {totalPages > 1 && (
            <div className={styles.paginationWrapper}>
                <PaginationComponent totalPages={totalPages}/>
            </div>
            )}

        </div>
    );
};

export default VenueManagementComponent;
