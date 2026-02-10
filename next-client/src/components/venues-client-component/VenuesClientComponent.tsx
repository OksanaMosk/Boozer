'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from "next/navigation";
import carService from "@/lib/services/carService";
import VenuesComponent from "@/components/venues-component/VenuesComponent";
import VenueFilterComponent from "@/components/venue-filter-component/VenueFilterComponent";
import { ICar } from "@/models/ICar";
import styles from "./VenuesClientComponent.module.css";

interface CarFilters {
    brand?: string;
    model?: string;
    condition?: string;
    price_min?: number;
    price_max?: number;
    year_min?: number;
    year_max?: number;
}

export const VenuesClientComponent = () => {
    const [filters, setFilters] = useState<CarFilters>({});
    const [carsData, setCarsData] = useState<ICar[]>([]);
    const [totalPagesState, setTotalPagesState] = useState(1);

    const searchParams = useSearchParams();
    const currentPageFromURL = Number(searchParams.get("pg") || "1");

    const buildQueryParams = (page: number, filters: CarFilters) => ({
        ...filters,
        page,
    });

    const fetchCars = useCallback(async (page: number, filters: CarFilters) => {
        try {
            const queryParams = buildQueryParams(page, filters);
            const response = await carService.getAll(queryParams);
            const resData = response.data;
            setCarsData(resData.filter((car: { status: string }) => car.status === "active") ?? []);
            setTotalPagesState(resData.total_pages ?? 1);
        } catch (error) {
            console.error("Error fetching venues:", error);
        }
    }, []);

    const handleFilterChange = (newFilters: CarFilters) => {
        setFilters(newFilters);
    };

    useEffect(() => {
        (async () => {
            await fetchCars(currentPageFromURL, filters);
        })();
    }, [currentPageFromURL, filters, fetchCars]);

    return (
        <div className={styles.wrapper}>
            <h1>Cars</h1>
            <VenueFilterComponent
                onFilterChange={handleFilterChange}
            />
            <VenuesComponent
                cars={carsData}
                totalPages={totalPagesState}
            />
        </div>
    );
};
