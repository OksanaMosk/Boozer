import { useState, useMemo } from "react";

export interface ServiceState {
    active: boolean;
    qty: number;
}

export const useOrderPricing = (
    extraServices: any[],
    currency: "UAH" | "USD" | "EUR",
    venueCurrency: "UAH" | "USD" | "EUR",
    rates: { USD: number; EUR: number }
) => {

    const [guestCount, setGuestCount] = useState(1);
    const [nightCount, setNightCount] = useState(1);

    const [serviceStates, setServiceStates] = useState<
        Record<number, ServiceState>
    >({});

    const [logisticsTotal, setLogisticsTotal] = useState(0);

    const convert = (amount: number, from: string, to: string) => {
        if (from === to) return amount;
        let inUAH = amount;
        if (from === "USD") inUAH = amount * rates.USD;
        if (from === "EUR") inUAH = amount * rates.EUR;
        if (to === "USD") return inUAH / rates.USD;
        if (to === "EUR") return inUAH / rates.EUR;
        return inUAH;
    };

    const servicesTotal = useMemo(() => {
        const totalInVenueCurrency = extraServices.reduce((sum, item) => {
            const state = serviceStates[Number(item.id)];
            if (!state?.active) return sum;
            const price = Number(item.price) || 0;
            const qty = Number(state.qty) || 1;
            if (item.service_type === "insurance") {
                return sum + (price * guestCount);
            }
            if (item.price_type === "per_day") {
                return sum + (price * nightCount * guestCount);
            }
            return sum + (price * qty);
        }, 0);

        return convert(totalInVenueCurrency, venueCurrency, currency);
    }, [extraServices, serviceStates, guestCount, nightCount, currency, venueCurrency, rates]);

    return {
        guestCount,
        setGuestCount,
        nightCount,
        setNightCount,
        serviceStates,
        setServiceStates,
        logisticsTotal,
        setLogisticsTotal,
        servicesTotal,
    };
};