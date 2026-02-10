'use client';

import React, { useState, useEffect } from "react";
import carService from "@/lib/services/carService";
import styles from './VenueFilterComponent.module.css';

interface FilterProps {
  onFilterChange: (filters: Record<string, any>) => void;
}

const VenueFilterComponent: React.FC<FilterProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    brand: "",
    model: "",
    condition: "",
    location: "",
    price: "",
    year: "",
    sort_by: "year",
    sort_order: "desc" as "asc" | "desc",
  });

  const [brands, setBrands] = useState<string[]>([]);
  const [modelsByBrand, setModelsByBrand] = useState<Record<string, string[]>>({});
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    carService.getConstants()
      .then(({ data }) => {
        setBrands(data.brands);
        setModelsByBrand(data.models_by_brand);
        setLocations(data.locations);
      })
      .catch((err) => console.error("Failed to load car constants", err));
  }, []);

  const availableModels = filters.brand ? modelsByBrand[filters.brand] || [] : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };

    if (name === "brand") {
      newFilters.model = "";
    }
      setFilters(newFilters);
      onFilterChange(newFilters);
  };

    return (
        <div className={styles.filterContainer}>
            <div className={styles.row}>
                <select name="brand" value={filters.brand} onChange={handleChange} className={styles.select}>
                    <option value="">All Brands</option>
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>

                <select name="model" value={filters.model} onChange={handleChange} className={styles.select}
                        disabled={!filters.brand}>
                    <option value="">All Models</option>
                    {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                </select>

                <select name="condition" value={filters.condition} onChange={handleChange} className={styles.select}>
                    <option value="">All Conditions</option>
                    <option value="new">New</option>
                    <option value="used">Used</option>
                </select>

                <select name="location" value={filters.location} onChange={handleChange} className={styles.select}>
                    <option value="">All Locations</option>
                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
            </div>

            <div className={styles.row}>
                <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={filters.price}
                    onChange={handleChange}
                    className={styles.input}
                />
                <input
                    type="number"
                    name="year"
                    placeholder="Year"
                    value={filters.year}
                    onChange={handleChange}
                    className={styles.input}
                />

                <select name="sort_by" value={filters.sort_by} onChange={handleChange} className={styles.select}>
                    <option value="year">Year</option>
                    <option value="price">Price</option>
                    <option value="location">Location</option>
                </select>

                <select name="sort_order" value={filters.sort_order} onChange={handleChange} className={styles.select}>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </div>
        </div>
    );
};

export default VenueFilterComponent;
