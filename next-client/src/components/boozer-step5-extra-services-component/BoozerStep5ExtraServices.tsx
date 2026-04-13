"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import { exchangeService } from "@/lib/services/exchangeService";
import { IOrder } from "@/models/IOrder";
import OrderTravelCostComponent from "@/components/order-travel-cost-component/OrderTravelCostComponent";
import OrderExtraServicesComponent from "@/components/order-extra-services-component/OrderExtraServicesComponent";
import { useOrderPricing } from "@/hooks/useOrderPricing";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import styles from "./BoozerStep5ExtraServices.module.css";

interface Props {
    venueId: string;
    orderId: number;
    onNext: () => void;
    onBack: () => void;
}

const BoozerStep5ExtraServices = ({venueId, orderId, onNext, onBack}: Props) => {
    const {user} = useUser();
    const [order, setOrder] = useState<IOrder | null>(null);
    const [extraServices, setExtraServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [isBackLoading, setIsBackLoading] = useState(false);
    const [includeLogistics, setIncludeLogistics] = useState(true);
    const [lastTravelData, setLastTravelData] = useState<any>(null);
    const [currency, setCurrency] = useState<"UAH" | "USD" | "EUR">("UAH");
    const [venueCurrency, setVenueCurrency] = useState<"UAH" | "USD" | "EUR">("UAH");
    const [rates, setRates] = useState<{ USD: number; EUR: number }>({USD: 1, EUR: 1});
    const [isSaving, setIsSaving] = useState(false);

    const {
        guestCount,
        setGuestCount,
        nightCount,
        setNightCount,
        serviceStates,
        setServiceStates,
        logisticsTotal,
        setLogisticsTotal,
        servicesTotal,
    } = useOrderPricing(extraServices, currency, venueCurrency, rates);

    useEffect(() => {
        const initExchange = async () => {
            if (user?.token) {
                const data = await exchangeService.init(user.token);
                setRates(data);
            }
        };
        void initExchange();
    }, [user?.token]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.token) return;
            try {
                const [orderRes, servRes, travelLogisticsRes]: any = await Promise.all([
                    venueServices.venues.orders({accessToken: user.token})(venueId).get(orderId),
                    venueServices.venues.extraServices({accessToken: user.token})(venueId).getAll(),
                    venueServices.venues.travelLogistics({accessToken: user.token})(venueId).getAll()
                ]);
                const orderData = orderRes.data || orderRes;
                const servicesData = servRes.data.data || servRes;
                const travelLogisticsData = travelLogisticsRes.data || travelLogisticsRes;
                setOrder(orderData);

                const venueCurr = travelLogisticsData.data?.[0]?.currency || "UAH";
                setVenueCurrency(venueCurr);
                setCurrency(venueCurr);

                setExtraServices(Array.isArray(servicesData) ? servicesData : []);
                setGuestCount(orderData.guests_count || 1);
                if (orderData.start_date && orderData.end_date) {
                    const start = new Date(orderData.start_date);
                    const end = new Date(orderData.end_date);
                    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                    setNightCount(days > 0 ? days : 1);
                }
            } catch (error) {
                setMessage("Failed to load services data.");
            } finally {
                setIsLoading(false);
            }
        };
        void fetchData();
    }, [venueId, orderId, user?.token]);

    useEffect(() => {
        if (order && order.extra_services && order.extra_services.length > 0) {
            const initialStates: Record<number, { active: boolean; qty: number }> = {};
            order.extra_services.forEach((s: any) => {
                const serviceId = s.service?.id || s.service;
                if (serviceId) {
                    initialStates[Number(serviceId)] = {
                        active: true,
                        qty: s.quantity || 1
                    };
                }
            });
            setServiceStates(initialStates);
        }
    }, [order, setServiceStates]);

    const handleSave = async () => {
        if (!user?.token) return;
        setIsSaving(true);
        setMessage("");
        const payload = {
            guests_count: guestCount,
            travel_calculation: lastTravelData,
            extra_services: Object.entries(serviceStates)
                .filter(([_, state]) => state.active)
                .map(([id, state]) => {
                    const sId = Number(id);
                    const sInfo = extraServices.find(s => s.id === sId);
                    let finalQty = state.qty || 1;
                    if (sInfo?.price_type === "per_day") {
                        finalQty = nightCount;
                    } else if (sInfo?.service_type === "insurance") {
                        finalQty = guestCount;
                    }

                    return {
                        service: sId,
                        quantity: finalQty
                    };
                }),
        };
        try {
            await venueServices.venues.orders({accessToken: user.token})(venueId).update(orderId, payload as any);
            onNext();
        } catch (error:any) {
            setMessage(error.response?.data?.detail || "Error saving extra services.");
        } finally {
            setIsSaving(false);
        }
    };

    const computedTotalAmount = includeLogistics ? logisticsTotal + servicesTotal : servicesTotal;

    const handleBack = async () => {
        if (!user?.token) return;
        if (!user?.token) return;
        setIsBackLoading(true);
        try {
            const allBookings = await venueServices.venues.bookings({accessToken: user.token})(venueId)("").getAllByVenue({
                lower: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString(),
                upper: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
            });
            const resData = allBookings.data;
            const orderBookings = resData.filter(b => b.order === orderId);
            for (const booking of orderBookings) {
                await venueServices.venues
                    .bookings({accessToken: user.token})(venueId)(String(booking.table))
                    .delete(String(booking.id));
            }
            onBack();
        } catch (error) {
            onBack();
        } finally {
            setIsBackLoading(false);
        }
    };


    if (isLoading) return <div className={styles.loader}><LoaderComponent/></div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Step 5:</h2>
            <div className={styles.section}>
                <div className={styles.wrapperTitle}>
                    <h4 className={styles.bigText}>Transfer &</h4>
                    <p className={styles.smallText}>Services</p>
                </div>
                <div className={styles.selectCurrency}>
                    <label className={styles.label}>Currency</label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value as any)}
                            className={styles.select}>
                        <option value="UAH">UAH</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                    </select>
                </div>
                <OrderTravelCostComponent
                    venueId={venueId}
                    userLatitude={order?.user_latitude ?? null}
                    userLongitude={order?.user_longitude ?? null}
                    userCity={order?.user_city ?? null}
                    userToken={user?.token ?? null}
                    onTotalChange={setLogisticsTotal}
                    onCalculationComplete={setLastTravelData}
                    currency={currency}
                    venueCurrency={venueCurrency}
                    rates={rates}
                />
            </div>
            <div className={styles.includeLogisticsToggle}>
                <label className={styles.switch}
                >
                    <input
                        type="checkbox"
                        checked={includeLogistics}
                        onChange={() => setIncludeLogistics(p => !p)}
                        style={{marginRight: '0.5rem'}}
                    /> <span className={styles.slider}></span>
                </label>
            </div>

            <div className={styles.section}>
                {extraServices.length > 0 ? (
                    <OrderExtraServicesComponent
                        services={extraServices}
                        guestCount={guestCount}
                        setGuestCount={setGuestCount}
                        nightCount={nightCount}
                        setNightCount={setNightCount}
                        serviceStates={serviceStates}
                        setServiceStates={setServiceStates}
                        currency={currency}
                        venueCurrency={venueCurrency}
                        rates={rates}
                    />
                ) : (
                    <p className={styles.noServices}>Extra services are currently unavailable for this venue.</p>
                )}
            </div>
            <div className={styles.footer}>
                <div className={styles.summaryBox}>
                    <p className={styles.summary}>
                        Services: {servicesTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })} {currency}
                    </p>

                    {includeLogistics && (
                        <p className={styles.summary}>
                            Logistics: {logisticsTotal.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })} {currency}
                        </p>
                    )}

                    <p className={styles.orderSummary}>
                        Total Amount: {computedTotalAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })} {currency}
                    </p>
                </div>

            </div>
             {message && <p className={styles.errorMessage}>{message}</p>}
            <div className={styles.actions}>
                <button onClick={handleBack} className={styles.buttonPrev} disabled={isBackLoading}>
                    {isBackLoading ?
                        <div className={`authButton ${styles.loaderWrapper}`}><LoaderComponent/></div> : "Back"}
                </button>
                <button onClick={handleSave} className={styles.buttonNext} disabled={isSaving}>
                    {isSaving ? <div className={`authButton ${styles.loaderWrapper}`}><LoaderComponent/></div> : "Next"}
                </button>
            </div>
        </div>
    );
};

export default BoozerStep5ExtraServices;