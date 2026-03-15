"use client"
import {AxiosResponse} from "axios";
import React, { useEffect, useState } from 'react';

import venueServices from "@/lib/services/venueService";
import { useUser } from "@/app/contexts/UserProvider";
import {ITravelLogistics} from "@/models/ITravel";
import {IExtraService} from "@/models/IVenue";

interface Props {
    venueId: string;
}
const TravelLogisticsFormComponent: React.FC<Props> = ({ venueId }) => {
    const { user } = useUser();
    const token = user?.token ? { accessToken: user.token } : undefined;
    const [loading, setLoading] = useState(false);
    const [savedLogistics, setSavedLogistics] = useState<ITravelLogistics[]>([]);
    const [savedExtras, setSavedExtras] = useState<IExtraService[]>([]);
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

    const fetchData = async () => {
    if (!user?.token || !venueId) return;
    try {
        const [logRes, extraRes]:AxiosResponse[] = await Promise.all([
            venueServices.venues.travelLogistics(token!)(venueId).getAll(),
            venueServices.venues.extraServices(token!)(venueId).getAll()
        ]);
        const actualLogistics = logRes.data.data || [];
        const actualExtras = extraRes.data.data || [];
        console.log("Logistics Array:", actualLogistics);
        console.log("Extras Array:", actualExtras);
        setSavedLogistics(actualLogistics);
        setSavedExtras(actualExtras);
        if (actualLogistics.length > 0) {
            setLogistics(actualLogistics);
        }
        if (actualExtras.length > 0) {
            setExtraServices(actualExtras);
        }

    } catch (err) {
        console.error("Помилка завантаження:", err);
    }
};

    useEffect(() => { void fetchData(); }, [venueId, user?.token]);

    const handleLogisticsChange = (type: string, value: string) => {
        const numValue = Math.max(0, parseFloat(value) || 0);
        setLogistics(prev => prev.map(item =>
            item.step_type === type ? { ...item, price_per_km: numValue } : item
        ));
    };

    const handleServiceChange = (type: string, field: keyof IExtraService, value: string) => {
        setExtraServices(prev => prev.map(item =>
            item.service_type === type
                ? { ...item, [field]: field === 'price' ? Math.max(0, parseFloat(value) || 0) : value }
                : item
        ));
    };

    const handleSave = async () => {
        if (!token) return alert("Log In please");
        setLoading(true);
        try {
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
            alert("Збережено успішно!");
            await fetchData();
        } catch (err) {
            alert("Помилка збереження");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 max-w-3xl mx-auto p-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-5 rounded-2xl border border-dashed border-gray-300">
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3"></h4>
                    {savedLogistics.length > 0 ? savedLogistics.map(l => (
                        <div key={l.step_type} className="flex justify-between py-1 text-sm border-b last:border-0">
                            <span className="capitalize">{l.step_type.replace('_', ' ')}</span>
                            <span className="font-mono font-bold">{l.price_per_km} {l.currency}/km</span>
                        </div>
                    )) : <p className="text-gray-400 text-sm italic">Дані відсутні</p>}
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-dashed border-gray-300">
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Поточні послуги</h4>
                    {savedExtras.length > 0 ? savedExtras.map(s => (
                        <div key={s.service_type} className="flex justify-between py-1 text-sm border-b last:border-0">
                            <span className="capitalize">{s.service_type}</span>
                            <span className="font-mono font-bold">{s.price} {s.price_type === 'per_day' ? `${s.currency}/day` : `${s.currency}`}</span>
                        </div>
                    )) : <p className="text-gray-400 text-sm italic">Дані відсутні</p>}
                </div>
            </div>

            <hr className="border-gray-200" />

            <div className="space-y-6">
                <h2 className="text-2xl font-black text-gray-900 text-center">Оновити або створити тарифи</h2>

                <div className="bg-white p-6 border rounded-xl shadow-sm">
                    <h3 className="text-lg font-bold mb-5 text-indigo-600">Налаштування логістики</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {logistics.map((item) => (
                            <div key={item.step_type} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                                <label className="capitalize flex-1 font-medium">{item.step_type?.replace('_', ' ')}</label>
                                <input
                                    type="number" step="0.1"
                                    value={item.price_per_km  || ""}
                                    onChange={(e) => handleLogisticsChange(item.step_type!, e.target.value)}
                                    className="border border-gray-300 p-2 rounded-lg w-28 text-right outline-none focus:ring-2 focus:ring-indigo-400"
                                />
                                <span className="text-xs text-gray-400 w-12">{item.currency}/km</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 border rounded-xl shadow-sm">
                    <h3 className="text-lg font-bold mb-5 text-green-600">Додаткові сервіси</h3>
                    <div className="space-y-4">
                        {extraServices.map((service) => (
                            <div key={service.service_type} className="flex items-center gap-4 border-b pb-4 last:border-0">
                                <div className="flex-1">
                                    <p className="font-bold capitalize text-gray-700">{service.service_type}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">{service.price_type?.replace('_', ' ')}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">$</span>
                                    <input
                                        type="number"
                                        value={service.price  || ""}
                                        onChange={(e) => handleServiceChange(service.service_type!, 'price', e.target.value)}
                                        className="border border-gray-300 p-2 rounded-lg w-28 text-right outline-none focus:ring-2 focus:ring-green-400"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 ${
                        loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'
                    }`}
                >
                    {loading ? "Saving..." : "Edit"}
                </button>
            </div>
        </div>
    );
};

export default TravelLogisticsFormComponent;




