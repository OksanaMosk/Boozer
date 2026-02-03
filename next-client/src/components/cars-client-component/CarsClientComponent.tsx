'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from "next/navigation";
import { carService } from "@/lib/services/carService";
import CarsComponent from "@/components/cars-component/CarsComponent";
import CarFilterComponent from "@/components/car-filter-component/CarFilterComponent";
import { ICar } from "@/models/ICar";
import styles from "./CarsClientComponent.module.css";

interface CarFilters {
    brand?: string;
    model?: string;
    condition?: string;
    price_min?: number;
    price_max?: number;
    year_min?: number;
    year_max?: number;
}

export const CarsClientComponent = () => {
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
            console.error("Error fetching cars:", error);
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
            <CarFilterComponent
                onFilterChange={handleFilterChange}
            />
            <CarsComponent
                cars={carsData}
                totalPages={totalPagesState}
            />
        </div>
    );
};
