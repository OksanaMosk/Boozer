'use client';

import React, { useState, useEffect } from "react";
import styles from "./VenueFilterComponent.module.css";
import venueServices, { VenueFilterCriteria } from "@/lib/services/venueService";

interface FilterProps {
  onFilterChange: (filters: VenueFilterCriteria) => void;
}

const VenueFilterComponent: React.FC<FilterProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<VenueFilterCriteria>({
    country: "",
    city: "",
    rating_min: undefined,
    rating_max: undefined,
    sort_by: "rating",
    sort_order: "desc",
    tags: [],
  });

  const [countriesList, setCountriesList] = useState<string[]>([]);
  const [citiesByCountry, setCitiesByCountry] = useState<Record<string, string[]>>({});

  useEffect(() => {
    venueServices.constants
      .getConstants()
      .then(({ data }) => {
        setCountriesList(data.countries || []);
        setCitiesByCountry(data.cities_by_country || {});
      })
      .catch((err) => console.error("Failed to load venue constants", err));
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

    if (name.includes("rating")) {
      newValue = value ? Number(value) : undefined;
    }
    else if (name === "tags") {
    newValue = value.split(",").map((t) => t.trim()).filter((t) => t !== "");
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

  return (
    <div className={styles.filterContainer}>
      <div className={styles.row}>
        <select
          name="country"
          value={filters.country || ""}
          onChange={handleChange}
          className={styles.select}
        >
          <option value="">All Countries</option>
          {countriesList.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          name="city"
          value={filters.city || ""}
          onChange={handleChange}
          disabled={!filters.country}
          className={styles.select}
        >
          <option value="">All Cities</option>
          {availableCities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
          <input
              type="text"
              name="tags"
              placeholder="Search by tags (comma-separated)"
              value={filters.tags || ""}
              onChange={handleChange}
              className={styles.input}
          />
          <input
              type="number"
              name="rating_min"
              placeholder="Min Rating"
              value={filters.rating_min ?? ""}
              onChange={handleChange}
              className={styles.input}
        />

        <input
          type="number"
          name="rating_max"
          placeholder="Max Rating"
          value={filters.rating_max ?? ""}
          onChange={handleChange}
          className={styles.input}
        />
      </div>

      <div className={styles.row}>
        <select
          name="sort_by"
          value={filters.sort_by}
          onChange={handleChange}
          className={styles.select}
        >
          <option value="rating">Rating</option>
          <option value="average_check">Average Check</option>
          <option value="reviews_count">Reviews Count</option>
          <option value="views">Views</option>
        </select>

        <select
          name="sort_order"
          value={filters.sort_order}
          onChange={handleChange}
          className={styles.select}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </div>
  );
};

export default VenueFilterComponent;
