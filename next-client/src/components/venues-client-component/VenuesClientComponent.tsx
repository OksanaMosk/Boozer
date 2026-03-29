'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {useRouter, useSearchParams} from "next/navigation";
import venueService, { VenueFilterCriteria } from "@/lib/services/venueService";
import { IVenue } from "@/models/IVenue";
import VenuesComponent from "@/components/venues-component/VenuesComponent";
import VenueFilterComponent from "@/components/venue-filter-component/VenueFilterComponent";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import styles from "./VenuesClientComponent.module.css";
import {useUser} from "@/app/contexts/UserProvider";

interface VenueFilters {
    name?: string;
    country?: string;
    city?: string;
    tags?: string[];
    sort_by?: string;
    sort_order?: string;
}

export const VenuesClientComponent = () => {
    const [venuesData, setVenuesData] = useState<IVenue[]>([]);
    const [totalPagesState, setTotalPagesState] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isUnauthorized, setIsUnauthorized] = useState(false);
    const searchParams = useSearchParams();
    const currentPageFromURL = Number(searchParams.get("page") || "1");
    const router = useRouter();
    const {user} = useUser();
    const [filters, setFilters] = useState<VenueFilters>({
        country: searchParams.get("country") || undefined,
        city: searchParams.get("city") || undefined,
        name: searchParams.get("name") || undefined,
        sort_by: (searchParams.get("sort_by") as any) || "rating",
        sort_order: (searchParams.get("sort_order") as any) || "desc",
        tags: searchParams.get("tags")?.split(",").filter(t => t !== "") || [],
    });

    useEffect(() => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== "" && value !== null) {
                if (Array.isArray(value)) {
                    if (value.length > 0) params.set(key, value.join(","));
                } else {
                    params.set(key, String(value));
                }
            }
        });

        if (currentPageFromURL > 1) params.set("page", String(currentPageFromURL));

        const queryString = params.toString();
        router.push(queryString ? `?${queryString}` : "/venues", {scroll: false});
    }, [filters, currentPageFromURL, router]);

    const fetchVenues = useCallback(async (page: number, filters: VenueFilters) => {
        setIsLoading(true);
        setIsUnauthorized(false);
        const apiParams = {
            ...filters,
            tags: Array.isArray(filters.tags) ? filters.tags.join(",") : filters.tags || undefined,
            ordering: filters.sort_order === "desc" ? `-${filters.sort_by}` : filters.sort_by,
            page
        };
        try {
            const auth = (user?.token && user.token.length > 0)
                ? {accessToken: user.token}
                : undefined;
            const response = await venueService.venues.getAllWithFilter(apiParams as any, auth);
            setVenuesData(response.data.data ?? []);
            setTotalPagesState(response.data.total_pages ?? 1);
        } catch (error: any) {
            if (error.message === "Please Sign In") {
                setIsUnauthorized(true);
                const res = await venueService.venues.getAllWithFilter(apiParams as any);
                setVenuesData(res.data.data ?? []);
            }
            console.error("Error fetching venues:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user?.token]);


    const handleFilterChange = (newFilters: VenueFilterCriteria) => {
        setFilters(newFilters);
    };

    useEffect(() => {
        void fetchVenues(currentPageFromURL, filters);
    }, [currentPageFromURL, filters, fetchVenues]);

    return (
        <div className={styles.wrapper}>
            <h1 className={styles.title}>Venues</h1>
            <VenueFilterComponent onFilterChange={handleFilterChange}/>
            {isLoading ? (
                <div className={styles.loaderWrapper}><LoaderComponent/></div>
            ) : (
                <VenuesComponent
                    venues={venuesData}
                    totalPages={totalPagesState}
                    isUnauthorized={isUnauthorized}
                />
            )}
        </div>
    );
};