"use client";
import React, { useEffect, useState, useMemo } from "react";
import venueServices from "@/lib/services/venueService";
import styles from "./OrderTravelCostComponent.module.css";
import { ITravelCalculation, ITravelSegment } from "@/models/ITravel";
import { AxiosResponse } from "axios";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";

interface Props {
    venueId: string;
    userLatitude: number | null;
    userLongitude: number | null;
    userCity: string | null;
    userToken: string | null;
    onTotalChange?: (total: number) => void;
    currency?: "UAH" | "USD" | "EUR";
    venueCurrency?: "UAH" | "USD" | "EUR";
    rates?: { USD: number; EUR: number };
    onCalculationComplete?: (data: ITravelCalculation) => void;
}

const OrderTravelCostComponent = ({
                                      venueId,
                                      userLatitude,
                                      userLongitude,
                                      userCity,
                                      userToken,
                                      onTotalChange,
                                      currency,
                                      venueCurrency,
                                      rates = {USD: 1, EUR: 1},
                                      onCalculationComplete
                                  }: Props) => {
    const [segments, setSegments] = useState<ITravelSegment[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [totalUAH, setTotalUAH] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

   const convert = (amount: number, fromCurrency: "UAH" | "USD" | "EUR" = venueCurrency!) => {
    if (currency === fromCurrency) return amount;

    let amountInUAH = amount;
    if (fromCurrency === "USD") amountInUAH = amount * rates.USD;
    else if (fromCurrency === "EUR") amountInUAH = amount * rates.EUR;

    if (currency === "USD") return +(amountInUAH / rates.USD).toFixed(2);
    if (currency === "EUR") return +(amountInUAH / rates.EUR).toFixed(2);
    return +amountInUAH.toFixed(2);
};

    useEffect(() => {
        if (!userToken || !userLatitude || !userLongitude) return;
        const fetchTravel = async () => {
            setLoading(true);
            try {
                const res: AxiosResponse = await venueServices
                    .venues
                    .travelLogistics({accessToken: userToken})(venueId)
                    .calculate(userLatitude, userLongitude);

                const data = res.data as ITravelCalculation;
                if (!data?.airports?.start?.lat || !data?.airports?.end?.lat) {
                    setError("Flight route coordinates are missing.");
                    setLoading(false);
                    return;
                }
                onCalculationComplete?.(data);
                const seg: ITravelSegment[] = [
                    {
                        step_type: "to_airport",
                        km: data.travel_segments[0]?.km || 0,
                        price: data.travel_segments[0]?.price || 0,
                        from_city: userCity || data.user_city || "Current Location",
                        cost: data.travel_segments[0]?.km ? data.travel_segments[0].price / data.travel_segments[0].km : 0,
                        to_city: `${data.airports.start?.city || "Airport"} (${data.airports.start?.code || ""})`,
                        from_code: "",
                        to_code: data.airports.start?.code || "",
                    },
                    {
                        step_type: "flight",
                        km: data.travel_segments[1]?.km || 0,
                        price: data.travel_segments[1]?.price || 0,
                        cost: data.travel_segments[1]?.km ? data.travel_segments[1].price / data.travel_segments[1].km : 0,
                        from_city: `${data.airports.start?.city || "Airport"} (${data.airports.start?.code || ""})`,
                        to_city: `${data.airports.end?.city || "Airport"} (${data.airports.end?.code || ""})`,
                        from_code: data.airports.start?.code || "",
                        to_code: data.airports.end?.code || "",
                    },
                    {
                        step_type: "from_airport",
                        km: data.travel_segments[2]?.km || 0,
                        price: data.travel_segments[2]?.price || 0,
                        cost: data.travel_segments[2]?.km ? data.travel_segments[2].price / data.travel_segments[2].km : 0,
                        from_city: data.airports.end?.city || "Airport",
                        to_city: data.venue?.city || "Venue Destination",
                        from_code: data.airports.end?.code || "",
                        to_code: "",
                    },
                ];
                setSegments(seg);
                const totalPriceUAH = seg.reduce((sum, s) => sum + s.price, 0);
                setTotalUAH(totalPriceUAH);
            } catch (e) {
                setError("Failed to fetch travel data");
            } finally {
                setLoading(false);
            }
        };
        void fetchTravel();
    }, [venueId, userLatitude, userLongitude, userToken]);

    useEffect(() => {
    onTotalChange?.(convert(totalUAH));
}, [totalUAH, currency, rates, onTotalChange]);

    const total = useMemo(() => convert(totalUAH), [totalUAH, currency, rates])
    if (loading) return (<div className={styles.loader}><LoaderComponent/></div>)
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.wrapper}>
            {segments.map((seg, idx) => {
                const iconUrl = seg.step_type === "flight" ? "/images/services/plane.webp" : "/images/services/bus.webp";
                const title = seg.step_type.replace("_", " ").toUpperCase();
                const segmentTotal = convert(seg.price);
                const costPerKm = seg.km ? (segmentTotal / seg.km).toFixed(2) : "0.00";

                return (
                    <div key={idx} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <p className={styles.icon}>
                                <img
                                src={iconUrl}
                                alt={seg.step_type}
                                width={60}
                                height={60}
                                className={styles.img}
                            />
                        </p>
                        </div>

                        <div className={styles.route}>
                            <div className={styles.routeRow}>
                                   <strong className={styles.title}>{title}</strong>
                                <div className={styles.point}>
                                    <p className={styles.cityName}>{seg.from_city}</p>
                                    {/*{seg.from_code && <span className={styles.code}>{seg.from_code}</span>}*/}→
                                    <p className={styles.cityName}>{seg.to_city}</p>
                                    {/*{seg.to_code && <span className={styles.code}>{seg.to_code}</span>}*/}
                                </div>
                            </div>
                            <div className={styles.priceDetails}>
                                <p className={styles.math}>
                                    {seg.km.toFixed(1)} km × {costPerKm} {currency}<strong className={styles.segment}>/</strong>km
                                </p>
                                <strong className={styles.segmentTotal}>
                                  Total:  {convert(seg.price).toLocaleString()} {currency}
                                </strong>
                            </div>
                        </div>
                    </div>
                );
            })}

            <div className={styles.totalFooter}>
                <span>Total Logistics:</span>
                <span className={styles.totalAmount}>{total.toLocaleString()} {currency}</span>
            </div>
        </div>
    );
};

export default OrderTravelCostComponent;
