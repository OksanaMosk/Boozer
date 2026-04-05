
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {useRouter} from "next/navigation";
import { useUser } from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import { exchangeService } from "@/lib/services/exchangeService";
import BoozerTravelMapComponent from "@/components/boozer_travel_map_component/BoozerTravelMapComponent";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import styles from "./BoozerStep6Summary.module.css";

const BoozerStep6Summary = ({ venueId, orderId, onNext }: any) => {
    const { user } = useUser();
    const [order, setOrder] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [currency, setCurrency] = useState<"UAH" | "USD" | "EUR">("UAH");
    const [rates, setRates] = useState({USD: 1, EUR: 1});
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();
    const getConverted = (amount: number, itemCurrency: string = order?.currency || "USD") => {
        if (currency === itemCurrency) return amount;

        if (itemCurrency === "UAH") {
            const rate = currency === "USD" ? rates.USD : rates.EUR;
            return +(amount / rate).toFixed(2);
        }
        if (itemCurrency === "USD") {
            const rate = currency === "UAH" ? rates.USD : (rates.USD / rates.EUR);
            return +(amount * rate).toFixed(2);
        }
        if (itemCurrency === "EUR") {
            const rate = currency === "UAH" ? rates.EUR : (rates.EUR / rates.USD);
            return +(amount * rate).toFixed(2);
        }
        return amount;
    };
    useEffect(() => {
        const initData = async () => {
            if (!user?.token) return;
            try {
                const [orderRes, exchangeRes] = await Promise.all([
                    venueServices.venues.orders({accessToken: user.token})(venueId).get(orderId),
                    exchangeService.init(user.token)
                ]);
                const data = orderRes.data;
                console.log("data:", data)

                console.log("--- AUDIT START ---");
                console.log("1. Menu Total:", data?.menu_total);
                console.log("2. Services Total:", data?.services_total);
                console.log("3. Flight Price:", data?.flight_price);
                console.log("4. Transfer Price:", data?.transfer_price);
                console.log("--- MATH CHECK ---");
                const mTotal = Number(data?.menu_total || 0);
                const sTotal = Number(data?.services_total || 0);
                const fPrice = Number(data?.flight_price || 0);
                const tPrice = Number(data?.transfer_price || 0);

                const mathTotal = mTotal + sTotal + fPrice + tPrice;

                console.log("Real Sum (JS Calculation):", mathTotal.toFixed(2));
                console.log("Total Price (from backend DB):", data?.total_price);
                console.log("Difference:", (mathTotal - Number(data?.total_price || 0)).toFixed(2));
                console.log("--- AUDIT END ---");

                setOrder(data);
                setTimeLeft(data.remaining_seconds || 0);
                if (data.currency) {
                    setCurrency(data.currency);
                }
                setRates(exchangeRes);
            } catch (e) {
                console.error(e);
            }
        };
        void initData();
    }, [orderId, venueId, user?.token]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const mapData = useMemo(() => {
        if (!order) return null;
        const travel = order.travel_calculation;

        return {
            start: {lat: order.user_latitude || 0, lng: order.user_longitude || 0},
            end: {lat: order.venue_latitude || 0, lng: order.venue_longitude || 0},

            airStart: travel?.airports?.start
                ? {lat: travel.airports.start.lat, lng: travel.airports.start.lng} : null,
            airEnd: travel?.airports?.end
                ? {lat: travel.airports.end.lat, lng: travel.airports.end.lng} : null,
        };
    }, [order]);

    const handleConfirm = async () => {
        if (!user?.token || !order || isSaving) return;

        setIsSaving(true);
        try {
            const currentRate = currency === "UAH" ? 1 : rates[currency as keyof typeof rates];
            const payload = {
                currency: currency,
                exchange_rate: currentRate,
                status: 'HOLD'
            };
            await venueServices.venues.orders({accessToken: user.token})(venueId).update(orderId, payload as any);
            onNext();
        } catch (error) {
            setIsSaving(false);
        }
    };

    const handleCancel = async () => {
        if (!user?.token || !order || isSaving) return;

        if (!confirm("Are you sure you want to cancel this order?")) return;

        setIsSaving(true);
        try {
            const payload = {status: 'CANCELLED'};
            await venueServices.venues.orders({accessToken: user.token})(venueId).update(orderId, payload as any);
            router.push("/");
        } catch (error) {
            setIsSaving(false);
        }
    };

    if (!order) return <div className={styles.loader}><LoaderComponent/></div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Step 6:</h2>
            <div className={styles.wrapperTitle}>
                <h4 className={styles.bigText}>Confirm &</h4>
                <p className={styles.smallText}>pay</p>
            </div>
            <div className={styles.selectCurrency}>
                <label className={styles.label}>Currency</label>
                <select className={styles.select} value={currency} onChange={(e) => setCurrency(e.target.value as any)}>
                    <option value="UAH">UAH</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                </select>
            </div>

            <div className={styles.mainLayout}>
                <div className={styles.mapSide}>
                    {mapData && <BoozerTravelMapComponent mapData={mapData}/>}
                </div>

                <div className={styles.billSide}>
                    <h3 className={styles.billTitle}>Final Bill 🧾</h3>
                    <div className={styles.summaryTable}>
                        <div className={styles.items}>
                            {order.items && order.items.length > 0 ? (
                                <div className={styles.group}>
                                    <p className={styles.groupTitle}>🥗 Menu Items:</p>
                                    <ul className={styles.list}>
                                        {order.items.map((item: any) => (
                                            <li key={item.id} className={styles.listItem}>
                                                <p>
                                                    {item.menu_item_name}
                                                    <span>({item.quantity} pcs x {getConverted(Number(item.menu_item_price), order.currency).toLocaleString(undefined, {minimumFractionDigits: 2})} {currency}
                                                        )</span>
                                                </p>
                                                <p>
                                                    {getConverted(Number(item.menu_item_price) * item.quantity, order.currency)
                                                        .toLocaleString(undefined, {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })} {currency}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className={styles.subTotal}>
                                        <span>Menu Subtotal:</span>
                                        <b>
                                            {getConverted(Number(order.menu_total), order.currency).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })} {currency}
                                        </b>
                                    </div>

                                </div>
                            ) : (
                                <div className={styles.billRow}>
                                    <p className={styles.rowLabel}>🥗 Menu Total:</p>
                                    <span>0.00 {currency}</span>
                                </div>
                            )}

                            {order.extra_services && order.extra_services.length > 0 ? (
                                <div className={styles.group}>
                                    <p className={styles.groupTitle}>🛡️ Extra Services:</p>
                                    <ul className={styles.list}>
                                        {order.extra_services.map((extra: any) => {
                                            let rowTotal = Number(extra.price) * extra.quantity;
                                            if (extra.service_type === 'hotel') {
                                                rowTotal = rowTotal * (order.guests_count || 1);
                                            }
                                            return (
                                                <li key={extra.id} className={styles.billRowSmall}>
                                                    <p>
                                                        {extra.service_name}
                                                        <span>{extra.service_type === 'hotel' &&
                                                            ` (${extra.quantity} nights x ${order.guests_count} guests x ${getConverted(Number(extra.price), order.currency)} ${currency})`
                                                        }
                            </span>
                                                        <span>{extra.service_type === 'insurance' &&
                                                            ` (${order.guests_count} guests x ${getConverted(Number(extra.price), order.currency)} ${currency})`
                                                        }
                            </span>
                                                        <span>{(extra.service_type !== 'hotel' && extra.service_type !== 'insurance') &&
                                                            ` (${extra.quantity} x ${getConverted(Number(extra.price), order.currency)} ${currency})`
                                                        }</span>
                                                    </p>
                                                    <p>
                                                        <b>
                                                            {getConverted(rowTotal, order.currency).toLocaleString(undefined, {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            })} {currency}
                                                        </b>
                                                    </p>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    <div className={styles.subTotal}>
                                        <span>Services Subtotal:</span>
                                        <b>
                                            {getConverted(Number(order.services_total), order.currency)
                                                .toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })} {currency}
                                        </b>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.billRow}>
                                    <p>🛡️ Extra Services:</p>
                                    <span>0.00 {currency}</span>
                                </div>
                            )}
                            <div className={styles.billRowTransfers}>
                                <p>🚕 Transfers:</p>
                                <span>
                                    {getConverted(Number(order.transfer_price), order.currency)
                                        .toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {currency}
                                </span>
                            </div>
                            <div className={styles.billRowTransfers}>
                                <p>✈️ Flight Price:</p>
                                <span>
        {getConverted(Number(order.flight_price), order.currency)
            .toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {currency}
    </span>
                            </div>
                        </div>

                        <div className={styles.totalRow}>
                            <span>Total Amount:</span>
                            <b className={styles.totalPrice}>
                                {getConverted(Number(order.total_price), order.currency).toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                })} {currency}
                            </b>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button
                            className={styles.confirmBtn}
                            onClick={handleConfirm}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <div className={styles.loaderWrapper}>
                                    <LoaderComponent/>
                                </div>
                            ) : (
                                "Confirm"
                            )}</button>
                        <button
                            className={styles.cancelBtn}
                            onClick={handleCancel}
                            disabled={isSaving}
                        >
                            Cancel Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoozerStep6Summary;