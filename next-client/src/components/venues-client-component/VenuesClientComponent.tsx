'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {useRouter, useSearchParams} from "next/navigation";
import venueService, { VenueFilterCriteria } from "@/lib/services/venueService";
import { IVenue } from "@/models/IVenue";
import VenuesComponent from "@/components/venues-component/VenuesComponent";
import VenueFilterComponent from "@/components/venue-filter-component/VenueFilterComponent";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import styles from "./VenuesClientComponent.module.css";

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
    const searchParams = useSearchParams();
    const currentPageFromURL = Number(searchParams.get("page") || "1");

    const router = useRouter();


    const [filters, setFilters] = useState<VenueFilters>({
    country: searchParams.get("country") || undefined,
    city: searchParams.get("city") || undefined,
    name: searchParams.get("name") || undefined,
    sort_by: (searchParams.get("sort_by") as any) || "rating",
    sort_order: (searchParams.get("sort_order") as any) || "desc",
});

useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && (!Array.isArray(value) || value.length > 0)) {
            params.set(key, String(value));
        }
    });
    if (currentPageFromURL > 1) params.set("page", String(currentPageFromURL));

    router.push(`?${params.toString()}`, { scroll: false });
}, [filters, currentPageFromURL, router]);

    const fetchVenues = useCallback(async (page: number, filters: VenueFilters) => {
        setIsLoading(true);
        setVenuesData([]);
        try {
            const response = await venueService.venues.getAllWithFilter({
    ...filters,
    ordering: filters.sort_order === "desc" ? `-${filters.sort_by}` : filters.sort_by,
    page
} as any);
            const resData = response.data;
            setVenuesData(resData.data ?? []);
            setTotalPagesState(resData.total_pages ?? 1);
        } catch (error) {
            console.error("Error fetching venues:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

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
                />
            )}
        </div>
    );
};
