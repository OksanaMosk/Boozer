"use client"

import React, { useEffect, useState } from 'react';
import {AxiosResponse} from "axios";
import { useUser } from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import {ITravelLogistics} from "@/models/ITravel";
import {IExtraService} from "@/models/IVenue";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import styles from "./TravelLogisticsFormComponent.module.css"

interface Props {
    venueId: string;
}
const TravelLogisticsFormComponent: React.FC<Props> = ({ venueId }) => {
    const { user } = useUser();
    const token = user?.token ? {accessToken: user.token} : undefined;
    const [loading, setLoading] = useState(false);
    const [savedLogistics, setSavedLogistics] = useState<ITravelLogistics[]>([]);
    const [savedExtras, setSavedExtras] = useState<IExtraService[]>([]);
    const [logistics, setLogistics] = useState<Partial<ITravelLogistics>[]>([
        {step_type: 'to_airport', price_per_km: 0},
        {step_type: 'flight', price_per_km: 0},
        {step_type: 'from_airport', price_per_km: 0},
    ]);
    const [extraServices, setExtraServices] = useState<Partial<IExtraService>[]>([
        {service_type: 'hotel', price: 0, price_type: 'per_day', name: 'Hotel'},
        {service_type: 'insurance', price: 0, price_type: 'fixed', name: 'Insurance'},
        {service_type: 'decoration', price: 0, price_type: 'fixed', name: 'Decoration'},
    ]);

    const fetchData = async () => {
        if (!user?.token || !venueId) return;
        try {
            const [logRes, extraRes]: AxiosResponse[] = await Promise.all([
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

    useEffect(() => {
        void fetchData();
    }, [venueId, user?.token]);

    const handleLogisticsChange = (type: string, value: string) => {
        const numValue = Math.max(0, parseFloat(value) || 0);
        setLogistics(prev => prev.map(item =>
            item.step_type === type ? {...item, price_per_km: numValue} : item
        ));
    };

    const handleServiceChange = (type: string, field: keyof IExtraService, value: string) => {
        setExtraServices(prev => prev.map(item =>
            item.service_type === type
                ? {...item, [field]: field === 'price' ? Math.max(0, parseFloat(value) || 0) : value}
                : item
        ));
    };

    const handleSave = async () => {
        if (!token) return alert("Log In please");
        setLoading(true);
        try {
            await Promise.all([
                venueServices.venues.travelLogistics(token)(venueId).updatePrices(
                    logistics.map(l => ({step_type: l.step_type!, price_per_km: l.price_per_km || 0}))
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
            alert("Save!");
            await fetchData();
        } catch (err) {
            alert("Error Save");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.summaryGrid}>
                <div className={styles.card}>
                    <h4 className={styles.cardHeader}>Current Logistics</h4>
                    {savedLogistics.length > 0 ? savedLogistics.map(l => (
                        <div key={l.step_type} className={styles.row}>
                            <span className={styles.label}>{l.step_type.replace('_', ' ')}</span>
                            <span className={styles.value}>{l.price_per_km} {l.currency}/km</span>
                        </div>
                    )) : <p className={styles.emptyText}>No data available</p>}
                </div>

                <div className={styles.card}>
                    <h4 className={styles.cardHeader}>Current Services</h4>
                    {savedExtras.length > 0 ? savedExtras.map(s => (
                        <div key={s.service_type} className={styles.row}>
                            <p className={styles.label}>{s.service_type}</p>
                            <p className={styles.value}>
                                {s.price} {s.price_type === 'per_day' ? `${s.currency}/day` : `${s.currency}`}
                            </p>
                        </div>
                    )) : <p className={styles.emptyText}>No data available</p>}
                </div>
            </div>

            <hr className={styles.divider}/>
            <div className={styles.formWrapper}>
                <h2 className={styles.mainTitle}>Update or Create Rates</h2>

                <div className={styles.editorBlock}>
                    <h3 className={`${styles.blockTitle} styles.logisticsTitle`}>Logistics Settings</h3>
                    <div className={styles.inputList}>
                        {logistics.map((item) => (
                            <div key={item.step_type} className={styles.inputRow}>
                                <div className={styles.rowLeft}>
                                    <label className={styles.label}>{item.step_type?.replace('_', ' ')}</label>
                                    <input
                                        type="number" step="0.1"
                                        value={item.price_per_km || ""}
                                        onChange={(e) => handleLogisticsChange(item.step_type!, e.target.value)}
                                        className={styles.inputField}
                                    /></div>
                                <p className={styles.value}>{item.currency}/km</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.editorBlock}>
                    <h3 className={`${styles.blockTitle} styles.servicesTitle`}>Extra Services</h3>
                    <div className={styles.inputList}>
                        {extraServices.map((service) => (
                            <div key={service.service_type} className={styles.inputRow}>
                                <div className={styles.serviceType}>
                                    <p className={styles.label}>{service.service_type}</p>
                                    <p className={styles.value}>{service.price_type?.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        value={service.price || ""}
                                        onChange={(e) => handleServiceChange(service.service_type!, 'price', e.target.value)}
                                        className={styles.inputField}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className={styles.submitBtn}
                >
                    {loading ?
                        <div className={`authButton ${styles.loaderWrapper}`}><LoaderComponent/></div> : "Save Rates"}
                </button>
            </div>
        </div>
    );
};
export default TravelLogisticsFormComponent;




