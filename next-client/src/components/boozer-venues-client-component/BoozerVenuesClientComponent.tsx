'use client';

import React, { useState, useEffect} from 'react';
import {useRouter, useSearchParams} from "next/navigation";
import venueService from "@/lib/services/venueService";
import { IVenue } from "@/models/IVenue";
import VenueFilterComponent from "@/components/venue-filter-component/VenueFilterComponent";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import BoozerStep2OrderBaseInfoComponent from "@/components/boozer-step2-order-base-info-component/BoozerStep2OrderBaseInfoComponent";
import BoozerStep3MenuComponent from "@/components/boozer-step3-menu-component/BoozerStep3MenuComponent";
import BoozerStep5ExtraServices from "@/components/boozer-step5-extra-services-component/BoozerStep5ExtraServices";
import BoozerStep6Summary from "@/components/boozer-step6-summary-component/BoozerStep6Summary";
import BoozerStep7Final from "@/components/boozer-step7-final-component/BoozerStep7FinalComponent";
import BoozerStep4TableSelectionComponent
    from "@/components/boozer-step4-table-selection-component/BoozerStep4TableSelectionComponent";
import {BoozerProgressBarComponent} from "@/components/boozer-progress-bar-component/BoozerProgressBarComponent";
import BoozerStep1VenuesComponent from "@/components/boozer-step1-venues-component/BoozerStep1VenuesComponent";
import styles from "./BoozerVenuesClientComponent.module.css";
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

export const BoozerVenuesClientComponent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useUser();
    const [venuesData, setVenuesData] = useState<IVenue[]>([]);
    const [totalPagesState, setTotalPagesState] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedVenue, setSelectedVenue] = useState<IVenue | null>(null);
    const step = Number(searchParams.get("step") || "1");
    const confirmedOrderId = searchParams.get("orderId") ? Number(searchParams.get("orderId")) : null;

    useEffect(() => {
        let isCancelled = false;
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            const page = Number(searchParams.get("page") || "1");
            const venueIdFromURL = searchParams.get("venueId");

            try {
                if (venueIdFromURL && !selectedVenue) {
                    const response = await venueService.venues.get(venueIdFromURL);
                    if (!isCancelled && response.data) {
                        setSelectedVenue(response.data);
                    }
                }
                if (step === 1) {
                    const currentFilters: any = Object.fromEntries(searchParams.entries());
                    if (searchParams.get("tags")) {
                        currentFilters.tags = searchParams.get("tags")?.split(",").filter(Boolean);
                    }

                    const auth = user?.token ? { accessToken: user.token } : undefined;
                    const response = await venueService.venues.getAllWithFilter({
                        ...currentFilters,
                        page
                    }, auth);

                    if (!isCancelled) {
                        setVenuesData(response.data.data ?? []);
                        setTotalPagesState(response.data.total_pages ?? 1);
                    }
                }
            } catch (err: any) {
                if (isCancelled) return;
                if (err.response?.status === 404 && page > 1) {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("page", "1");
                    router.push(`?${params.toString()}`, { scroll: false });
                    return;
                }
                setError("Failed to load venues. Please check your connection.");
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        };

        void fetchData();
        return () => { isCancelled = true; };
    }, [searchParams, user?.token, step, selectedVenue, router]);

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
            currentParams.delete("step");
            currentParams.delete("venueId");
            currentParams.delete("orderId");

            const isFiltersChanged = params.toString() !== currentParams.toString();

            params.set("step", "1");
            params.set("page", isFiltersChanged ? "1" : (searchParams.get("page") || "1"));

            const newQueryString = params.toString();
            if (newQueryString !== searchParams.toString()) {
                router.push(`?${newQueryString}`, { scroll: false });
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
                            applyParams({
                                ...newFilters,
                                lat: ipData.lat,
                                lon: ipData.lng
                            });
                        } else {
                            applyParams({ ...newFilters, sort_by: 'rating' });
                        }
                    }
                );
                return;
            }
        }

        if (newFilters.sort_by !== 'distance') {
            delete (newFilters as any).lat;
            delete (newFilters as any).lon;
        }

        applyParams(newFilters);
    };

    const updateNavigation = (
    nextStep: number,
    orderId?: number | string | null,
    venueId?: number | string | null
) => {
    const params = new URLSearchParams();
    params.set("step", String(nextStep));

    const finalVenueId = venueId || selectedVenue?.id;
    const finalOrderId = orderId || confirmedOrderId;

    if (finalVenueId) params.set("venueId", String(finalVenueId));
    if (finalOrderId) params.set("orderId", String(finalOrderId));

    router.push(`?${params.toString()}`, { scroll: false });
    window.scrollTo(0, 0);
};

    const handleSelectVenue = (venue: IVenue) => {
        setSelectedVenue(venue);
        updateNavigation(2, undefined, venue.id);

    };

    const handleStep2Submit = (orderId: number) => updateNavigation(3, orderId);
    const handleStep3MenuSubmit = () => updateNavigation(4);
    const handleStep4TableSubmit = () => updateNavigation(5);
    const handleStep5ExtraSubmit = () => updateNavigation(6);
    const handleStep6ConfirmPayment = () => updateNavigation(7);

    const handleResetWizard = () => {
        setSelectedVenue(null);
        router.push(`?step=1`, { scroll: false });
        window.scrollTo(0, 0);
    };

    const renderStepContent = () => {
        if (step === 7 && confirmedOrderId && selectedVenue) {
            return <BoozerStep7Final venueId={String(selectedVenue.id)} orderId={confirmedOrderId} onReset={handleResetWizard} />;
        }
        if (step === 6 && confirmedOrderId && selectedVenue) {
            return <BoozerStep6Summary venueId={String(selectedVenue.id)} orderId={confirmedOrderId} onNext={handleStep6ConfirmPayment} onBack={() => updateNavigation(5)} />;
        }
        if (step === 5 && confirmedOrderId && selectedVenue) {
            return <BoozerStep5ExtraServices venueId={String(selectedVenue.id)} orderId={confirmedOrderId} onNext={handleStep5ExtraSubmit} onBack={() => updateNavigation(4)} />;
        }
        if (step === 4 && confirmedOrderId && selectedVenue) {
            return <BoozerStep4TableSelectionComponent venueId={String(selectedVenue.id)} orderId={confirmedOrderId} onNext={handleStep4TableSubmit} onBack={() => updateNavigation(3)} />;
        }
        if (step === 3 && confirmedOrderId && selectedVenue) {
            return <BoozerStep3MenuComponent venueId={String(selectedVenue.id)} orderId={confirmedOrderId} onNext={handleStep3MenuSubmit} onBack={() => updateNavigation(2)} />;
        }
        if (step === 2 && selectedVenue) {
            return <BoozerStep2OrderBaseInfoComponent venueId={selectedVenue.id!} onBack={() => updateNavigation(1)} onNext={handleStep2Submit} />;
        }

        return (
            <>
                {error && <div className={styles.titleLog}>⚠️ {error}</div>}
                <h1 className={styles.title}>Step 1: Choose Venue</h1>
                <VenueFilterComponent onFilterChange={handleFilterChange} />
                {isLoading ? (
                    <div className={styles.loaderWrapper}><LoaderComponent /></div>
                ) : (
                    <BoozerStep1VenuesComponent
                        venues={venuesData}
                        totalPages={totalPagesState}
                        onSelectVenue={handleSelectVenue}
                    />
                )}
            </>
        );
    };

    return (
        <div className={styles.wrapper}>
            <BoozerProgressBarComponent
                currentStep={step}
                orderId={confirmedOrderId ?? 0}
                venueId={selectedVenue?.id ?? 0}
                onExpire={() => {
                    setIsLoading(false);
                    handleResetWizard();
                    setError("Your booking time has expired. Please select a venue and start again.");
                }}
            />
            <div className={styles.stepContent}>
                {renderStepContent()}
            </div>
        </div>
    );
};
