"use client"

import React, { useState, useEffect } from "react";
import styles from "./VenueSelectsComponent.module.css";
import venueServices from "@/lib/services/venueService";

interface VenueSelectsProps {
    city: string;
    country: string;
    setCity: (city: string) => void;
    setCountry: (country: string) => void;
}

const VenueSelectsComponent: React.FC<VenueSelectsProps> = ({country, city, setCountry, setCity}) => {
    const [countriesList, setCountriesList] = useState<string[]>([]);
    const [cityByCountry, setCityByCountry] = useState<Record<string, string[]>>({});
    const [selectedCountry, setSelectedCountry] = useState(country)

    useEffect(() => {
        venueServices.venues
            .getConstants()
            .then(({data}) => {
                setCountriesList(data.countries);
                setCityByCountry(data.cities_by_country);
                console.log(data);

                if (!country && data.countries.length > 0) {
                    const firstCountry = data.countries[0];
                    setSelectedCountry(firstCountry);
                    setCountry(firstCountry);

                    const firstCity = data.cities_by_country[firstCountry]?.[0] || "";
                    setCity(firstCity);
                }
            })
            .catch((err) => console.error("Failed to load constants", err));
    }, []);
    const availableCity = selectedCountry ? cityByCountry[selectedCountry] || [] : [];

    const handleCountryChange = (value: string) => {
        setSelectedCountry(value);
        setCountry(value);
        setCity("");
    };

    return (
        <div className={styles.filters}>
            <select
                className={styles.select}
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}>
                <option value="">Select Country</option>
                {(countriesList || []).map((b) => (
                    <option key={b} value={b}>
                        {b}
                    </option>
                ))}
            </select>
            {selectedCountry && (
                <select
                    className={styles.select}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}>
                    <option value="">Select City</option>
                    {availableCity.map((m) => (
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
