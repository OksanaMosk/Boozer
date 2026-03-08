"use client";

import React, { useState, useEffect } from "react";
import { GoogleMap, Polyline, Marker, useJsApiLoader } from "@react-google-maps/api";
import styles from "./BoozerStep6Summary.module.css";
import { AxiosResponse } from "axios";
import { useUser } from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";

interface Props {
    venueId: string; // Обов'язково додав venueId
    orderId: number;
    onNext: () => void;
    onBack: () => void;
}

const BoozerStep6Summary: React.FC<Props> = ({ venueId, orderId, onNext, onBack }) => {
    const { user } = useUser();
    const [order, setOrder] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);
 const token = user?.token ? { accessToken: user.token } : undefined;
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
    });

    useEffect(() => {

        const fetchOrder = async () => {
            if (!user?.token || !venueId) return;
            try {
                const res: AxiosResponse = await venueServices.venues
                    .orders({ accessToken: user.token })(venueId)
                    .get(orderId);

                setOrder(res.data);
                setTimeLeft(res.data.remaining_seconds || 0);
            } catch (err) {
                console.error("Error fetching order summary:", err);
            }
        };

        void fetchOrder();
    }, [orderId, venueId, user?.token]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    if (!order || !isLoaded) return <div className={styles.loader}>Finalizing your trip... ✈️</div>;

    // Безпечне отримання координат для карти
    const travel = order.travel_calculation;
    const userLat = parseFloat(order.user_latitude) || 0;
    const userLng = parseFloat(order.user_longitude) || 0;
    const venueLat = parseFloat(order.venue_latitude) || 0;
    const venueLng = parseFloat(order.venue_longitude) || 0;

    const path = [
        { lat: userLat, lng: userLng },
        { lat: travel?.airports?.start?.lat || userLat, lng: travel?.airports?.start?.lng || userLng },
        { lat: travel?.airports?.end?.lat || venueLat, lng: travel?.airports?.end?.lng || venueLng },
        { lat: venueLat, lng: venueLng }
    ];

    // Розрахунок вартості меню (Total - (Extras + Logistics))
    const menuTotal = (
        Number(order.total_price || 0) -
        Number(order.transfer_price || 0) -
        Number(order.flight_price || 0) -
        Number(order.extra_services_price || 0)
    ).toFixed(2);

    return (
        <div className={styles.container}>
            <div className={styles.timerHeader}>
                ⏱️ Reservation expires in: <b>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</b>
            </div>

            <div className={styles.mainLayout}>
                <div className={styles.mapSide}>
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '400px', borderRadius: '15px' }}
                        center={path[0]}
                        zoom={3}
                    >
                        <Polyline
                            path={path}
                            options={{
                                geodesic: true,
                                strokeColor: "#ff4d4d",
                                strokeOpacity: 1.0,
                                strokeWeight: 3,
                            }}
                        />
                        <Marker position={path[0]} label="You" />
                        <Marker position={path[3]} label="Venue" />
                    </GoogleMap>
                </div>

                <div className={styles.billSide}>
                    <h3>Final Bill 🧾</h3>
                    <div className={styles.items}>
                        <div className={styles.billRow}>
                            <p>🥗 Menu Total:</p>
                            <span>{menuTotal} {order.currency}</span>
                        </div>
                        <div className={styles.billRow}>
                            <p>🛡️ Extra Services:</p>
                            <span>{order.extra_services_price} {order.currency}</span>
                        </div>
                        <div className={styles.billRow}>
                            <p>🚕 Transfers:</p>
                            <span>{order.transfer_price} {order.currency}</span>
                        </div>
                        <div className={styles.billRow}>
                            <p>✈️ Flight Price:</p>
                            <span>{order.flight_price} {order.currency}</span>
                        </div>
                    </div>
                    <hr />
                    <div className={styles.total}>
                        <p>Total:</p>
                        <h1>{order.total_price} {order.currency}</h1>
                    </div>
                    <p className={styles.rate}>Rate: 1 {order.currency} = {order.exchange_rate} UAH</p>
                </div>
            </div>

            <div className={styles.actions}>
                <button className={styles.backBtn} onClick={onBack}>Edit Order</button>
                <button className={styles.confirmBtn} onClick={onNext}>
                    CONFIRM & GO TO PAYMENT ➔
                </button>
            </div>
        </div>
    );
};

export default BoozerStep6Summary;
