"use client";

import React, { useState, useEffect } from "react";
import venueService from "@/lib/services/venueService";
import { IVenue } from "@/models/IVenue";
import VenueInfoComponent from "@/components/venue-info-component/VenueInfoComponent";
import { ButtonGoBackComponent } from "@/components/button-go-back-component/ButtonGoBackComponent";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";

interface VenuePageClientProps {
  venueId: string;
}

export default function VenuePageClientComponent({venueId}: VenuePageClientProps) {
    const [venue, setVenue] = useState<IVenue | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!venueId) return;

        (async () => {
            try {
                const response = await venueService.venues.get(venueId);
                setVenue(response.data);
            } catch (err: any) {
                setError("Failed to fetch venue details");
            } finally {
                setLoading(false);
            }
        })();
    }, [venueId]);

    if (loading)
        return (
            <div style={{display: "flex", justifyContent: "center", marginTop: 70}}>
                <LoaderComponent/>
            </div>
        );

    if (error) return <div>{error}</div>;
    if (!venue) return <div>Venue not found</div>;

    return (
        <div>
            <ButtonGoBackComponent/>
            <VenueInfoComponent venue={venue}/>
            <ButtonScrollTopComponent/>
        </div>
    );
}
