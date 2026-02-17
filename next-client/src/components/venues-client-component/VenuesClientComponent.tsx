'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from "next/navigation";
import venueService, { VenueFilterCriteria } from "@/lib/services/venueService";
import VenuesComponent from "@/components/venues-component/VenuesComponent";
import VenueFilterComponent from "@/components/venue-filter-component/VenueFilterComponent";
import { IVenue } from "@/models/IVenue";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import styles from "./VenuesClientComponent.module.css";

interface VenueFilters {
    name?: string;
    country?: string;
    city?: string;
    tags?: string[];
}

interface VenueQueryParams extends VenueFilterCriteria {
    page?: number;
}

export const VenuesClientComponent = () => {
    const [filters, setFilters] = useState<VenueFilters>({});
    const [venuesData, setVenuesData] = useState<IVenue[]>([]);
    const [totalPagesState, setTotalPagesState] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const searchParams = useSearchParams();
    const currentPageFromURL = Number(searchParams.get("page") || "1");

    const fetchVenues = useCallback(async (page: number, filters: VenueFilters) => {
        setIsLoading(true);
        setVenuesData([]);
        try {
            const response = await venueService.venues.getAllWithFilter({
                ...filters,
                page
            } as VenueQueryParams);

            const resData = response.data;
            console.log("API returned IDs:", resData.data.map(v => v.id));

            setVenuesData(resData.data ?? []);
            setTotalPagesState(resData.total_pages ?? 1);
        } catch (error) {
            console.error("Error fetching venues:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleFilterChange = (newFilters: VenueFilters) => {
        const apiFilters: VenueFilterCriteria = {
            name: newFilters.name,
            country: newFilters.country,
            city: newFilters.city,
            tags: newFilters.tags,
        };
        setFilters(apiFilters);
    };

    useEffect(() => {
        void fetchVenues(currentPageFromURL, filters);
    }, [currentPageFromURL, filters, fetchVenues]);

    console.log("Current page from URL:", currentPageFromURL);

    return (
        <div className={styles.wrapper}>
            <h1>Venues</h1>

            <VenueFilterComponent onFilterChange={handleFilterChange} />

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
