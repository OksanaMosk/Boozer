"use client";

import React, { useState, useEffect } from "react";
import  venueService from "@/lib/services/venueService";
import VenueInfoComponent from "@/components/venue-info-component/VenueInfoComponent";
import { ButtonGoBackComponent } from "@/components/button-go-back-component/ButtonGoBackComponent";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import { IVenue } from "@/models/IVenue";

interface CarsPageClientProps {
  carId: string;
}

export default function VenuesPageClient({carId}: CarsPageClientProps) {
    const [car, setCar] = useState<IVenue | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!carId) return;

        (async () => {
            try {
                const response = await venueService.get(venueId);
                setCar(response.data);
            } catch {
                setError("Failed to fetch car details");
            } finally {
                setLoading(false);
            }
        })();
    }, [carId]);

    if (loading) return <div style={{display: "flex", justifyContent: "center", marginTop: 50}}>
        <LoaderComponent/>
    </div>;

    if (error) return <div>{error}</div>;
    if (!car) return <div>Car not found</div>;


    return (
        <div>
            <ButtonGoBackComponent/>
            <VenueInfoComponent venue={venue}/>
        </div>
    );
}

