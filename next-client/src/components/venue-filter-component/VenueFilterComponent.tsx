'use client';

import React, { useState, useEffect } from "react";
import venueServices, { VenueFilterCriteria } from "@/lib/services/venueService";
import styles from "./VenueFilterComponent.module.css";
import { useSearchParams } from "next/navigation";

interface FilterProps {
    onFilterChange: (filters: VenueFilterCriteria) => void;
}

const VenueFilterComponent: React.FC<FilterProps> = ({ onFilterChange }) => {
    const searchParams = useSearchParams();
    const [message, setMessage] = useState<string | null>(null);
    const [filters, setFilters] = useState<VenueFilterCriteria>({
        search: searchParams.get("search") || "",
        country: searchParams.get("country") || "",
        city: searchParams.get("city") || "",
        sort_by: (searchParams.get("sort_by") as any) || "rating",
        sort_order: (searchParams.get("sort_order") as any) || "desc",
        rating_min: searchParams.get("rating_min") ? Number(searchParams.get("rating_min")) : undefined,
        rating_max: searchParams.get("rating_max") ? Number(searchParams.get("rating_max")) : undefined,
        min_check: searchParams.get("min_check") ? Number(searchParams.get("min_check")) : undefined,
        max_check: searchParams.get("max_check") ? Number(searchParams.get("max_check")) : undefined,
        currency: searchParams.get("currency") || "UAH",
        tags: searchParams.get("tags")?.split(",").map(t => t.trim()).filter(t => t !== "") || [],
    });

    const [countriesList, setCountriesList] = useState<string[]>([]);
    const [citiesByCountry, setCitiesByCountry] = useState<Record<string, string[]>>({});
    const [tagsInput, setTagsInput] = useState<string>(
        Array.isArray(filters.tags) ? filters.tags.join(", ") : ""
    );

    useEffect(() => {
        venueServices.constants
            .getConstants()
            .then(({ data }) => {
                setCountriesList(data.countries || []);
                setCitiesByCountry(data.cities_by_country || {});
            })
            .catch(() => {
                setMessage("Could not load country/city lists.");
            });
    }, []);


    const availableCities =
        filters.country && citiesByCountry[filters.country]
            ? citiesByCountry[filters.country]
            : [];

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        let newValue: any = value;

        if (name.includes("rating") || name.includes("check")) {
            newValue = value !== "" ? Number(value) : undefined;
             if (newValue !== undefined && newValue < 0) return;
             if (name.includes("rating") && newValue !== undefined && newValue > 5) {
            newValue = 5;
        }
        }

        const updatedFilters: VenueFilterCriteria = {
            ...filters,
            [name]: newValue,
        };

        if (name === "country") {
            updatedFilters.city = "";
        }

        setFilters(updatedFilters);
        onFilterChange(updatedFilters);
    };

    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTagsInput(e.target.value);
    };

    const handleTagsBlur = () => {
        const tagsArray = tagsInput.split(",").map((t) => t.trim()).filter((t) => t !== "");
        const updatedFilters = { ...filters, tags: tagsArray };
        setFilters(updatedFilters);
        onFilterChange(updatedFilters);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleTagsBlur();
    };

    useEffect(() => {
        const urlTags = searchParams.get("tags") || "";
        setTagsInput(urlTags);
        const tagsArray = urlTags.split(",").map(t => t.trim()).filter(t => t !== "");
        setFilters(prev => ({ ...prev, tags: tagsArray }));
    }, [searchParams]);

    const resetFilters = () => {
        const initialFilters: VenueFilterCriteria = {
            search: "",
            country: "",
            city: "",
            sort_by: "rating",
            sort_order: "desc",
            rating_min: undefined,
            rating_max: undefined,
            min_check: undefined,
            max_check: undefined,
            currency: "UAH",
            tags: [],
        };
         setMessage(null);
        setFilters(initialFilters);
        setTagsInput("");
        onFilterChange(initialFilters);
    };

    return (
        <div className={styles.filterContainer}>
              {message && <p className={styles.errorMessage}>{message}</p>}
            <div className={styles.row}>
                <select name="country" value={filters.country || ""}
                        onChange={handleChange}
                         aria-label="Select country"
                        className={styles.select}
                >
                    <option value="">All Countries</option>
                    {countriesList.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                    name="city"
                    value={filters.city || ""}
                    onChange={handleChange}
                    disabled={!filters.country}
                    aria-label="Select city"
                    className={styles.select}
                >
                    <option value="">All Cities</option>
                    {availableCities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                    type="text"
                    name="search"
                    placeholder="By keyword (music,...)"
                    value={filters.search || ""}
                    onChange={handleChange}
                    className={styles.input}
                />
            </div>

            <div className={styles.row}>
                <input
                    type="text"
                    placeholder="By tags (beach, night, club)"
                    value={tagsInput}
                    onChange={handleTagsChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleTagsBlur}
                    className={styles.input}
                />
                <input
                    type="number"
                    name="rating_min"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="Min Rating (min 0)"
                    value={filters.rating_min ?? ""}
                    onChange={handleChange}
                    onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                    className={styles.input}
                />
                <input
                    type="number"
                    name="rating_max"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="Max Rating (max 5)"
                    value={filters.rating_max ?? ""}
                    onChange={handleChange}
                    onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                    className={styles.input}
                />
            </div>

            <div className={styles.row}>
                <input
                    type="number"
                    name="min_check"
                    min="0"
                    placeholder="Min Check (min 0)"
                    value={filters.min_check ?? ""}
                    onChange={handleChange}
                    onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                    className={styles.input}
                />
                <input
                    type="number"
                    name="max_check"
                    min="0"
                    placeholder="Max Check"
                    value={filters.max_check ?? ""}
                    onChange={handleChange}
                    onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                    className={styles.input}
                />
                <select name="currency" value={filters.currency || "UAH"}
                        aria-label="Select currency"
                        onChange={handleChange}
                        className={styles.select}>
                    <option value="UAH">UAH (₴)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                </select>
            </div>

            <div className={styles.row}>
                <select name="sort_by" value={filters.sort_by}
                        onChange={handleChange}
                        aria-label="Sort by"
                        className={styles.select}>
                    <option value="rating">By Rating</option>
                    <option value="converted_check">By Average Check</option>
                    <option value="distance">Near Me (GPS)</option>
                    <option value="reviews_count">Reviews</option>
                    <option value="views">Views</option>
                    <option value="name">By Name</option>
                    <option value="created_at">Newest</option>
                </select>

                <select name="sort_order" value={filters.sort_order}
                         aria-label="Sort order"
                        onChange={handleChange} className={styles.select}>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>

                <button
                    type="button"
                    onClick={resetFilters}
                    className={styles.button}
                >
                    Clear All
                </button>
            </div>
        </div>
    );
};

export default VenueFilterComponent;
