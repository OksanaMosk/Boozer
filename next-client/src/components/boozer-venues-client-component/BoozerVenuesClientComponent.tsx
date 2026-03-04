'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from "next/navigation";
import venueService, { VenueFilterCriteria } from "@/lib/services/venueService";
import VenuesComponent from "@/components/venues-component/VenuesComponent";
import VenueFilterComponent from "@/components/venue-filter-component/VenueFilterComponent";
import { IVenue } from "@/models/IVenue";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import styles from "./BoozerVenuesClientComponent.module.css";
import BoozerVenuesComponent from "@/components/boozer-venues-component/BoozerVenuesComponent";

interface VenueFilters {
    name?: string;
    country?: string;
    city?: string;
    tags?: string[];
}

interface VenueQueryParams extends VenueFilterCriteria {
    page?: number;
}

export const BoozerVenuesClientComponent = () => {
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

    return (
        <div className={styles.wrapper}>
            <h1 className={styles.title}>Choose Venue</h1>

            <VenueFilterComponent onFilterChange={handleFilterChange} />

            {isLoading ? (
                <div className={styles.loaderWrapper}><LoaderComponent/></div>
            ) : (
                <BoozerVenuesComponent
                    venues={venuesData}
                    totalPages={totalPagesState}
                />
            )}
        </div>
    );
};
