"use client"

import React, { useState, useEffect } from "react";
import carService from "@/lib/services/carService";
import styles from "./VenueSelectsComponent.module.css";

interface CarSelectsProps {
    brand: string;
    model: string;
    condition: string;
    fuel_type: string;
    location: string;
    setBrand: (brand: string) => void;
    setModel: (model: string) => void;
    setCondition: (condition: string) => void;
    setFuelType: (fuelType: string) => void;
    setLocation: (location: string) => void;
}

const VenueSelectsComponent: React.FC<CarSelectsProps> = ({
                                                            brand,
                                                            model,
                                                            setBrand,
                                                            setModel,
                                                        }) => {
    const [brands, setBrands] = useState<string[]>([]);
    const [modelsByBrand, setModelsByBrand] = useState<Record<string, string[]>>({});
    const [locations, setLocations] = useState<string[]>([]);
    useEffect(() => {
        carService
            .getConstants()
            .then(({data}) => {
                setBrands(data.brands);
                setModelsByBrand(data.models_by_brand);
                setLocations(data.locations);
            })
            .catch((err) => console.error("Failed to load car constants", err));
    }, []);
    const availableModels = brand ? modelsByBrand[brand] || [] : [];
    const handleBrandChange = (value: string) => {
        setBrand(value);
        setModel("");
    };

    return (
        <div className={styles.filters}>
            <select className={styles.select} value={brand} onChange={(e) => handleBrandChange(e.target.value)}>
                <option value="">Select Country</option>
                {brands.map((b) => (
                    <option key={b} value={b}>
                        {b}
                    </option>
                ))}
            </select>
            {brand && (
                <select className={styles.select} value={model} onChange={(e) => setModel(e.target.value)}>
                    <option value="">Select Sity</option>
                    {availableModels.map((m) => (
                        <option key={m} value={m}>
                            {m}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
};

export default VenueSelectsComponent;
