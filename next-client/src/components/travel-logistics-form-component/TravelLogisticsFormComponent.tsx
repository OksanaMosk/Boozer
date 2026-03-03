"use client"

import React, { useEffect, useState } from 'react';
import { ITravelLogistics, IExtraService } from '@/models/IVenue';
import venueServices from "@/lib/services/venueService";
import { useUser } from "@/app/contexts/UserProvider";

interface Props {
    venueId: string;
}

const TravelLogisticsFormComponent: React.FC<Props> = ({ venueId }) => {
    const { user } = useUser();
    const token = user?.token ? { accessToken: user.token } : undefined;
    const [logistics, setLogistics] = useState<Partial<ITravelLogistics>[]>([
        { step_type: 'to_airport', price_per_km: 0 },
        { step_type: 'flight', price_per_km: 0 },
        { step_type: 'from_airport', price_per_km: 0 },
    ]);
    const [extraServices, setExtraServices] = useState<Partial<IExtraService>[]>([
        { service_type: 'hotel', price: 0, price_type: 'per_day', name: 'Hotel' },
        { service_type: 'insurance', price: 0, price_type: 'fixed', name: 'Insurance' },
        { service_type: 'decoration', price: 0, price_type: 'fixed', name: 'Decoration' },
    ]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.token) return;
            try {
                const [logRes, extraRes] = await Promise.all([
                    venueServices.venues.travelLogistics(token!)(venueId).getAll(),
                    venueServices.venues.extraServices(token!)(venueId).getAll()
                ]);

                if (logRes.data.length > 0) setLogistics(logRes.data);
                if (extraRes.data.length > 0) setExtraServices(extraRes.data);
            } catch (err) {
                console.error("Failed to load data", err);
            }
        };
        void fetchData();
    }, [venueId, user?.token]);

    const handleLogisticsChange = (type: string, value: string) => {
        setLogistics(prev => prev.map(item =>
            item.step_type === type ? { ...item, price_per_km: parseFloat(value) || 0 } : item
        ));
    };

    const handleServiceChange = (type: string, field: keyof IExtraService, value: string) => {
        setExtraServices(prev => prev.map(item =>
            item.service_type === type
                ? { ...item, [field]: field === 'price' ? parseFloat(value) || 0 : value }
                : item
        ));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (!token) return;

            // Зберігаємо обидва списки через updatePrices
            await Promise.all([
                venueServices.venues.travelLogistics(token)(venueId).updatePrices(
                    logistics.map(l => ({ step_type: l.step_type!, price_per_km: l.price_per_km || 0 }))
                ),
                venueServices.venues.extraServices(token)(venueId).updatePrices(
                    extraServices.map(s => ({
                        service_type: s.service_type!,
                        price: Number(s.price) || 0,
                        price_type: s.price_type!,
                        name: s.name || s.service_type!
                    }))
                )
            ]);
            alert("All prices updated successfully!");
        } catch (err) {
            alert("Error saving prices");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Блок Логістики */}
            <div className="p-4 border rounded shadow-sm bg-white">
                <h3 className="text-lg font-bold mb-4">Travel Logistics (per km)</h3>
                <div className="space-y-3">
                    {logistics.map((item) => (
                        <div key={item.step_type} className="flex items-center gap-4">
                            <label className="capitalize w-40">{item.step_type?.replace('_', ' ')}:</label>
                            <input
                                type="number"
                                step="0.01"
                                value={item.price_per_km}
                                onChange={(e) => handleLogisticsChange(item.step_type!, e.target.value)}
                                className="border p-2 rounded w-32 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Блок Додаткових послуг */}
            <div className="p-4 border rounded shadow-sm bg-white">
                <h3 className="text-lg font-bold mb-4">Extra Services Pricing</h3>
                <div className="space-y-4">
                    {extraServices.map((service) => (
                        <div key={service.service_type} className="flex items-center gap-4 border-b pb-3 last:border-0">
                            <div className="flex-1">
                                <p className="font-medium capitalize">{service.service_type}</p>
                                <p className="text-xs text-gray-500">{service.price_type === 'per_day' ? 'Charge per night' : 'Fixed total'}</p>
                            </div>
                            <input
                                type="number"
                                value={service.price}
                                placeholder="Price"
                                onChange={(e) => handleServiceChange(service.service_type!, 'price', e.target.value)}
                                className="border p-2 rounded w-32 outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
                {loading ? "Saving everything..." : "Save All Rates"}
            </button>
        </div>
    );
};

export default TravelLogisticsFormComponent;