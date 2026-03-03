"use client"

import React, { useEffect, useState } from 'react';

import { ITravelLogistics } from '@/models/IVenue';
import venueServices from "@/lib/services/venueService";
import {useUser} from "@/app/contexts/UserProvider";

interface Props {
    venueId: string;

}

const TravelLogisticsFormComponent: React.FC<Props> = ({ venueId }) => {
    const {user}=useUser()
    const [prices, setPrices] = useState<Partial<ITravelLogistics>[]>([
        { step_type: 'to_airport', price_per_km: 0 },
        { step_type: 'flight', price_per_km: 0 },
        { step_type: 'from_airport', price_per_km: 0 },
    ]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchExistingPrices = async () => {
            try {
                if(!user?.token) return
                const res = await venueServices.venues.travelLogistics({accessToken:user.token})(String(venueId)).getAll();
                if (res.data.length > 0) {
                    setPrices(res.data);
                }
            } catch (err) {
                console.error("Failed to load logistics prices", err);
            }
        };
        void fetchExistingPrices();
    }, [venueId, user?.token]);

    const handlePriceChange = (type: string, value: string) => {
        setPrices(prev => prev.map(item =>
            item.step_type === type ? { ...item, price_per_km: parseFloat(value) || 0 } : item
        ));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if(!user?.token) return
            const dataToSave = prices.map(p => ({
                step_type: p.step_type!,
                price_per_km: p.price_per_km || 0
            }));
            await venueServices.venues.travelLogistics({accessToken:user?.token})(String(venueId)).updatePrices(dataToSave);
            alert("Prices updated successfully!");
        } catch (err) {
            alert("Error saving prices");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded shadow-sm bg-white">
            <h3 className="text-lg font-bold mb-4">Travel Logistics Pricing (per km)</h3>
            <div className="space-y-4">
                {prices.map((item) => (
                    <div key={item.step_type} className="flex items-center justify-between gap-4">
                        <label className="capitalize flex-1">
                            {item.step_type?.replace('_', ' ')}:
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.price_per_km}
                            onChange={(e) => handlePriceChange(item.step_type!, e.target.value)}
                            className="border p-2 rounded w-32 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                ))}
            </div>
            <button
                onClick={handleSave}
                disabled={loading}
                className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
                {loading ? "Saving..." : "Save Logistics Rates"}
            </button>
        </div>
    );
};

export default TravelLogisticsFormComponent;