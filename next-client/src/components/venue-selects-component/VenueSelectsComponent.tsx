"use client";

import React, { useState, useEffect } from "react";
import venueServices from "@/lib/services/venueService";
import { fetchCoordinates } from "@/lib/services/geocodeService";
import styles from "./VenueSelectsComponent.module.css";

interface VenueSelectsProps {
    city: string;
    country: string;
    setCity: (city: string) => void;
    setCountry: (country: string) => void;
    setCoordinates: (latitude: number, longitude: number) => void;
}

const VenueSelectsComponent: React.FC<VenueSelectsProps> = ({
                                                                country,
                                                                city,
                                                                setCountry,
                                                                setCity,
                                                                setCoordinates
                                                            }) => {
    const [countriesList, setCountriesList] = useState<string[]>([]);
    const [cityByCountry, setCityByCountry] = useState<Record<string, string[]>>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        venueServices.constants
            .getConstants()
            .then(({data}) => {
                setCountriesList(data.countries);
                setCityByCountry(data.cities_by_country);
                setError(null);
            })
             .catch(() => setError("Failed to load countries list."));
    }, []);

    const availableCity = country ? cityByCountry[country] || [] : [];
    const handleCountryChange = (value: string) => {
        setCountry(value);
        setCity(""); // очищаємо місто
        setCoordinates(0, 0);
    };

    const handleCityChange = async (value: string) => {
        setCity(value);
        setError(null);
        if (value && country) {
            try {
                const coords = await fetchCoordinates(value, country);
                if (coords) {
                    setCoordinates(coords.latitude, coords.longitude);
                }
            } catch (error) {
                setError("Could not determine coordinates for this city.");
            }
        }
    };

    return (
        <div className={styles.filters}>
            <select
                className={styles.select}
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
            >
                <option
                    value="">Select Country
                </option>
                {countriesList.map((c) => (
                    <option
                        key={c} value={c}>
                        {c}
                    </option>
                ))}
            </select>

            {country && (
                <select
                    className={styles.select}
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                >
                    <option value="">Select City</option>
                    {availableCity.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            )}  {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
    );
};

export default VenueSelectsComponent;
