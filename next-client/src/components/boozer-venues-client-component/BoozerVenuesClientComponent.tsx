'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from "next/navigation";
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

export const BoozerVenuesClientComponent = () => {
    const [step, setStep] = useState(1);
    const [selectedVenue, setSelectedVenue] = useState<IVenue | null>(null);
    const [confirmedOrderId, setConfirmedOrderId] = useState<number | null>(null);
    const [filters, setFilters] = useState<any>({});
    const [venuesData, setVenuesData] = useState<IVenue[]>([]);
    const [totalPagesState, setTotalPagesState] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const currentPageFromURL = Number(searchParams.get("page") || "1");

    const fetchVenues = useCallback(async (page: number, filters: any) => {
        setIsLoading(true);
        setVenuesData([]);
        try {
            const response = await venueService.venues.getAllWithFilter({...filters, page});
            setVenuesData(response.data.data ?? []);
            setTotalPagesState(response.data.total_pages ?? 1);
        } catch (error) {
            console.error("Error fetching venues:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (step === 1) void fetchVenues(currentPageFromURL, filters);
    }, [currentPageFromURL, filters, fetchVenues, step]);

    const handleSelectVenue = (venue: IVenue) => {
        setSelectedVenue(venue);
        setStep(2);
        window.scrollTo(0, 0);
    };

    const handleStep2Submit = (orderId: number) => {
        setConfirmedOrderId(orderId);
        setStep(3);
        window.scrollTo(0, 0);
    };

    const handleStep3MenuSubmit = () => {
        setStep(4);
        window.scrollTo(0, 0);
    };

    const handleStep4TableSubmit = () => {
        setStep(5);
        window.scrollTo(0, 0);
    };

    const handleStep5ExtraSubmit = () => {
        setStep(6);
        window.scrollTo(0, 0);
    };

    const handleStep6ConfirmPayment = () => {
        setStep(7);
        window.scrollTo(0, 0);
    };

    const handleResetWizard = () => {
        setStep(1);
        setSelectedVenue(null);
        setConfirmedOrderId(null);
        window.scrollTo(0, 0);
    };

    const renderStepContent = () => {
        if (step === 7 && confirmedOrderId && selectedVenue) {
            return <BoozerStep7Final venueId={String(selectedVenue.id)} orderId={confirmedOrderId}
                                     onReset={handleResetWizard}/>;
        }
        if (step === 6 && confirmedOrderId && selectedVenue) {
            return <BoozerStep6Summary venueId={String(selectedVenue.id)} orderId={confirmedOrderId}
                                       onNext={handleStep6ConfirmPayment} onBack={() => setStep(5)}/>;
        }
        if (step === 5 && confirmedOrderId && selectedVenue) {
            return <BoozerStep5ExtraServices venueId={String(selectedVenue.id)} orderId={confirmedOrderId}
                                             onNext={handleStep5ExtraSubmit} onBack={() => setStep(4)}/>;
        }
        if (step === 4 && confirmedOrderId && selectedVenue) {
            return <BoozerStep4TableSelectionComponent venueId={String(selectedVenue.id)} orderId={confirmedOrderId}
                                                       onNext={handleStep4TableSubmit} onBack={() => setStep(3)}/>;
        }
        if (step === 3 && confirmedOrderId && selectedVenue) {
            return <BoozerStep3MenuComponent venueId={String(selectedVenue.id)} orderId={confirmedOrderId}
                                             onNext={handleStep3MenuSubmit} onBack={() => setStep(2)}/>;
        }
        if (step === 2 && selectedVenue) {
            return <BoozerStep2OrderBaseInfoComponent venueId={selectedVenue.id!} onBack={() => setStep(1)}
                                                      onNext={handleStep2Submit}/>;
        }

        return (
            <>
                <h1 className={styles.title}>Step 1: Choose Venue</h1>
                <VenueFilterComponent onFilterChange={(newFilters) => setFilters(newFilters)}/>
                {isLoading ? (
                    <div className={styles.loaderWrapper}><LoaderComponent/></div>
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
            />
            <div className={styles.stepContent}>
                {renderStepContent()}
            </div>
        </div>
    );
};