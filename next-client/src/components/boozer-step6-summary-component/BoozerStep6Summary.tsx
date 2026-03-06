"use client";

import React, { useState, useEffect } from "react";
import { GoogleMap, Polyline, Marker, useJsApiLoader } from "@react-google-maps/api";
import styles from "./BoozerStep6Summary.module.css";
import axios from "axios";
import { useUser } from "@/app/contexts/UserProvider";

interface Props {
    orderId: number;
    onNext: () => void;
    onBack: () => void;
}

const BoozerStep6Summary: React.FC<Props> = ({ orderId, onNext, onBack }) => {
    const { user } = useUser();
    const [order, setOrder] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
    });

    useEffect(() => {
        const fetchOrder = async () => {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setOrder(res.data);
            setTimeLeft(res.data.remaining_seconds);
        };
        if (user?.token) void fetchOrder();
    }, [orderId, user?.token]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    if (!order || !isLoaded) return <div className={styles.loader}>Finalizing your trip... ✈️</div>;
    const travel = order.travel_calculation;
    const path = [
        { lat: parseFloat(order.user_latitude), lng: parseFloat(order.user_longitude) },
        { lat: travel.airports.start.lat, lng: travel.airports.start.lng },
        { lat: travel.airports.end.lat, lng: travel.airports.end.lng },
        { lat: parseFloat(order.venue_latitude), lng: parseFloat(order.venue_longitude) }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.timerHeader}>
                ⏱️ Reservation expires in: <b>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</b>
            </div>

            <div className={styles.mainLayout}>
                <div className={styles.mapSide}>
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '400px' }}
                        center={path[1]}
                        zoom={4}
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
                        <p>🥗 Menu Total:
                            {/*<span>{order.total_price - order.transfer_price - order.flight_price - order.extra_services_price} {order.currency}</span>*/}
                        <span>{(Number(order.total_price) - Number(order.transfer_price) - Number(order.flight_price) - Number(order.extra_services_price)).toFixed(2)}</span>
                        </p>
                        <p>🛡️ Extra Services: <span>{order.extra_services_price} {order.currency}</span></p>
                        <p>🚕 Transfers: <span>{order.transfer_price} {order.currency}</span></p>
                        <p>✈️ Flight Price: <span>{order.flight_price} {order.currency}</span></p>

                    </div>
                    <hr />
                    <div className={styles.total}>
                        Total: <h1>{order.total_price} {order.currency}</h1>
                    </div>
                    <p className={styles.rate}>Rate: 1 {order.currency} = {order.exchange_rate} UAH</p>
                </div>
            </div>

            <div className={styles.actions}>
                <button onClick={onBack}>Edit Order</button>
                <button className={styles.confirmBtn} onClick={onNext}>
                    CONFIRM & GO TO PAYMENT ➔
                </button>
            </div>
        </div>
    );
};

export default BoozerStep6Summary;

