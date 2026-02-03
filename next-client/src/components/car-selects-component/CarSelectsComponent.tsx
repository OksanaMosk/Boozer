"use client"

import React, { useState, useEffect } from "react";
import { carService } from "@/lib/services/carService";
import styles from "./CarSelectsComponent.module.css";

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

const CarSelectsComponent: React.FC<CarSelectsProps> = ({
                                                            brand,
                                                            model,
                                                            condition,
                                                            fuel_type,
                                                            location,
                                                            setBrand,
                                                            setModel,
                                                            setCondition,
                                                            setFuelType,
                                                            setLocation,
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
                <option value="">Select Brand</option>
                {brands.map((b) => (
                    <option key={b} value={b}>
                        {b}
                    </option>
                ))}
            </select>
            {brand && (
                <select className={styles.select} value={model} onChange={(e) => setModel(e.target.value)}>
                    <option value="">Select Model</option>
                    {availableModels.map((m) => (
                        <option key={m} value={m}>
                            {m}
                        </option>
                    ))}
                </select>
            )}
            <select className={styles.select} value={condition} onChange={(e) => setCondition(e.target.value)}>
                <option value="new">New</option>
                <option value="used">Used</option>
            </select>
            <select className={styles.select} value={fuel_type} onChange={(e) => setFuelType(e.target.value)}>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
            </select>
            <select className={styles.select} value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">Select Location</option>
                {locations.map((loc) => (
                    <option key={loc} value={loc}>
                        {loc}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CarSelectsComponent;
