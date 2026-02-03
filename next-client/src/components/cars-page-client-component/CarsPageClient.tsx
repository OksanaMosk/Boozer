"use client";

import React, { useState, useEffect } from "react";
import { carService } from "@/lib/services/carService";
import CarInfoComponent from "@/components/car-info-component/CarInfoComponent";
import { GoBackButtonComponent } from "@/components/go-back-button-component/GoBackButtonComponent";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import { ICar } from "@/models/ICar";

interface CarsPageClientProps {
  carId: string;
}

export default function CarsPageClient({carId}: CarsPageClientProps) {
    const [car, setCar] = useState<ICar | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!carId) return;

        (async () => {
            try {
                const response = await carService.get(carId);
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
            <GoBackButtonComponent/>
            <CarInfoComponent car={car}/>
        </div>
    );
}

