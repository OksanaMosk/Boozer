'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from "next/navigation";
import venueService from "@/lib/services/venueService";
import VenuesComponent from "@/components/venues-component/VenuesComponent";
import VenueFilterComponent from "@/components/venue-filter-component/VenueFilterComponent";
import { IVenue } from "@/models/IVenue";
import styles from "./VenuesClientComponent.module.css";

interface venueFilters {
    brand?: string;
    model?: string;
    condition?: string;
    price_min?: number;
    price_max?: number;
    year_min?: number;
    year_max?: number;
}

export const VenuesClientComponent = () => {
    const [filters, setFilters] = useState<venueFilters>({});
    const [venuesData, setVenuesData] = useState<IVenue[]>([]);
    const [totalPagesState, setTotalPagesState] = useState(1);

    const searchParams = useSearchParams();
    const currentPageFromURL = Number(searchParams.get("pg") || "1");

    const buildQueryParams = (page: number, filters: venueFilters) => ({
        ...filters,
        page,
    });

    const fetchvenues = useCallback(async (page: number, filters: venueFilters) => {
        try {
            const queryParams = buildQueryParams(page, filters);
            const response = await venueService.venues.getAllWithFilter(queryParams);
            const resData = response.data;
            setVenuesData(resData.filter((venue: { status: string }) => venue.status === "active") ?? []);
            setTotalPagesState(resData.total_pages ?? 1);
        } catch (error) {
            console.error("Error fetching venues:", error);
        }
    }, []);

    const handleFilterChange = (newFilters: venueFilters) => {
        setFilters(newFilters);
    };

    useEffect(() => {
        (async () => {
            await fetchvenues(currentPageFromURL, filters);
        })();
    }, [currentPageFromURL, filters, fetchvenues]);

    return (
        <div className={styles.wrapper}>
            <h1>venues</h1>
            <VenueFilterComponent
                onFilterChange={handleFilterChange}
            />
            {/*<VenuesComponent*/}
            {/*    venues={venuesData}*/}
            {/*    totalPages={totalPagesState}*/}
            {/*/>*/}
        </div>
    );
};
