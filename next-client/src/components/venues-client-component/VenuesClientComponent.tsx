'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import venueService from "@/lib/services/venueService";
import { IVenue } from "@/models/IVenue";
import VenuesComponent from "@/components/venues-component/VenuesComponent";
import VenueFilterComponent from "@/components/venue-filter-component/VenueFilterComponent";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import styles from "./VenuesClientComponent.module.css";
import {useUser} from "@/app/contexts/UserProvider";
import {fetchCoordinatesByIP} from "@/lib/services/geoIpService";

interface VenueFilters {
    search?: string;
    country?: string;
    city?: string;
    tags?: string[];
    sort_by?: string;
    sort_order?: string;
    rating_min?: number;
    rating_max?: number;
    min_check?: number;
    max_check?: number;
    currency?: string;
    lat?: number;
    lon?: number;
}

export const VenuesClientComponent = () => {
    const [venuesData, setVenuesData] = useState<IVenue[]>([]);
    const [totalPagesState, setTotalPagesState] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isUnauthorized, setIsUnauthorized] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const {user} = useUser();

    useEffect(() => {
        let isCancelled = false;
        const fetchVenues = async () => {
            setIsLoading(true);
            setIsUnauthorized(false);
            const page = Number(searchParams.get("page") || "1");
            const currentFilters: any = Object.fromEntries(searchParams.entries());

            if (searchParams.get("tags")) {
                currentFilters.tags = searchParams.get("tags")?.split(",").filter(Boolean);
            }

            try {
                const auth = user?.token ? {accessToken: user.token} : undefined;
                const response = await venueService.venues.getAllWithFilter({
                    ...currentFilters,
                    page
                }, auth);
                if (!isCancelled) {
                    setVenuesData(response.data.data ?? []);
                    setTotalPagesState(response.data.total_pages ?? 1);
                }

            } catch (error: any) {
                if (isCancelled) return;
                if (error.response?.status === 404 && page > 1) {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("page", "1");
                    router.push(`?${params.toString()}`, {scroll: false});
                    return;
                }
                if (error.response?.status === 401) setIsUnauthorized(true);
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        void fetchVenues();
        return () => {
            isCancelled = true;
        };
    }, [searchParams, user?.token, router]);

    const handleFilterChange = async (newFilters: VenueFilters) => {
        const params = new URLSearchParams();

        const applyParams = (filters: any) => {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    if (Array.isArray(value)) {
                        if (value.length > 0) params.set(key, value.join(","));
                    } else {
                        params.set(key, String(value));
                    }
                }
            });

            const currentParams = new URLSearchParams(searchParams.toString());
            currentParams.delete("page");

            const isFiltersChanged = params.toString() !== currentParams.toString();
            params.set("page", isFiltersChanged ? "1" : (searchParams.get("page") || "1"));

            const newQueryString = params.toString();
            if (newQueryString !== searchParams.toString()) {
                router.push(`?${newQueryString}`, {scroll: false});
            }
        };

        if (newFilters.sort_by === 'distance' && !newFilters.lat) {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        applyParams({
                            ...newFilters,
                            lat: pos.coords.latitude,
                            lon: pos.coords.longitude
                        });


                    },
                  async () => {
                    const ipData = await fetchCoordinatesByIP();
                    if (ipData) {
                        applyParams({ ...newFilters, lat: ipData.lat, lon: ipData.lng });
                    } else {
                        applyParams({ ...newFilters, sort_by: 'rating' });
                    }
                }
                );
                return;
            }
        }

        if (newFilters.sort_by !== 'distance') {
            delete newFilters.lat;
            delete newFilters.lon;
        }

        applyParams(newFilters);
    };


    return (
        <div className={styles.wrapper}>
            <h1 className={styles.title}>Venues</h1>
            <VenueFilterComponent onFilterChange={handleFilterChange}/>

            {isLoading ? (
                <div className={styles.loaderWrapper}>
                    <LoaderComponent/>
                </div>
            ) : (
                <VenuesComponent
                    key={searchParams.toString()}
                    venues={venuesData}
                    totalPages={totalPagesState}
                    isUnauthorized={isUnauthorized}
                />
            )}
        </div>
    );
};
