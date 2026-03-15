"use client";
import React, {useEffect, useMemo} from "react";
import styles from "./OrderExtraServicesComponent.module.css";

interface Props {
  services: any[];
  guestCount: number;
  setGuestCount: React.Dispatch<React.SetStateAction<number>>;
  nightCount: number;
  setNightCount: React.Dispatch<React.SetStateAction<number>>;
  serviceStates: Record<number, { active: boolean; qty: number }>;
  setServiceStates: React.Dispatch<any>;
  currency?: "UAH" | "USD" | "EUR";
  venueCurrency?: "UAH" | "USD" | "EUR";
  onTotalChange?: (total: number) => void;
  rates?: { USD: number; EUR: number };
}

const OrderExtraServicesComponent = ({venueCurrency,
  services, guestCount, setGuestCount, nightCount, setNightCount, onTotalChange,
  serviceStates, setServiceStates, currency = "UAH", rates = { USD: 1, EUR: 1 },

}: Props) => {
  const convert = (amount: number, fromCurrency: "UAH" | "USD" | "EUR" = venueCurrency!) => {
    if (currency === fromCurrency) return amount;

    let amountInUAH = amount;
    if (fromCurrency === "USD") amountInUAH = amount * rates.USD;
    else if (fromCurrency === "EUR") amountInUAH = amount * rates.EUR;

    if (currency === "USD") return +(amountInUAH / rates.USD).toFixed(2);
    if (currency === "EUR") return +(amountInUAH / rates.EUR).toFixed(2);
    return +amountInUAH.toFixed(2);
};

  // const calculateRowUAH = (s: any, state: any) => {
  //   const price = Number(s.price) || 0;
  //   if (!state?.active) return 0;
  //   if (s.service_type === "insurance") return price * guestCount;
  //   if (s.price_type === "per_day") return price * nightCount * guestCount;
  //   return price * (state.qty || 1);
  // };

    const calculateRow = (s: any, state: any) => {
  const price = Number(s.price) || 0;
  if (!state?.active) return 0;
  if (s.service_type === "insurance") return price * guestCount;
  if (s.price_type === "per_day") return price * nightCount * guestCount;
  return price * (state.qty || 1);
};

  const rows = [
    {
      items: services.filter(s => s.price_type === "per_day"),
      counter: { label: "Nights", val: nightCount, setter: setNightCount }
    },
    {
      items: services.filter(s => s.service_type === "insurance"),
      counter: { label: "Guests", val: guestCount, setter: setGuestCount }
    },
    {
      items: services.filter(s => s.price_type !== "per_day" && s.service_type !== "insurance"),
      counter: null
    }
  ];
  const totalVenue = useMemo(() =>
  services.reduce((acc, s) => acc + calculateRow(s, serviceStates[s.id]), 0),
  [services, serviceStates, guestCount, nightCount]
);

useEffect(() => {
  onTotalChange?.(convert(totalVenue));
}, [totalVenue, currency, rates, onTotalChange]);

  return (
    <div className={styles.container}>
      {rows.map((row, idx) => (
        <div key={idx} className={styles.row}>
          {row.items.map((s) => {
            const state = serviceStates[s.id] || { active: false, qty: 1 };
            const rowTotalUAH = calculateRow(s, state);

            let iconPath = "/images/services/decor.webp";
            if (s.service_type === "insurance") iconPath = "/images/services/insurance.webp";
            if (s.price_type === "per_day") iconPath = "/images/services/hotel.webp";

              return (
                  <div key={s.id} className={`${styles.serviceBox} ${state.active ? styles.active : ""}`}>
                      <div className={styles.serviceHeader}>
                          <div className={styles.iconContainer}>
                              <img src={iconPath} alt="service" width={200} height={150}
                                   className={styles.serviceIcon}/>
                          </div>
                          <div  className={styles.bottomContainer}>
                              <strong  className={styles.title} >{s.name}</strong>
                              <div className={styles.counterWrap}>{row.counter && (
                                  <div className={styles.counterBox}>
                                      <label>{row.counter.label}</label>
                                      <div className={styles.counter}>
                                          <button onClick={() => row.counter?.setter((p) => Math.max(1, p - 1))}>-
                                          </button>
                                          <span>{row.counter.val}</span>
                                          <button onClick={() => row.counter?.setter((p) => p + 1)}>+</button>
                                      </div>
                                  </div>
                              )} {state.active && (
                                  <div className={styles.calcRow}>

                                      {convert(Number(s.price), venueCurrency).toLocaleString()} {currency} × {
                                      s.price_type === "per_day" ? `${nightCount}  nights х ${guestCount} guests` :
                                          s.service_type === "insurance" ? `${guestCount} guests` : state.qty
                                  }
                                    <b> = {convert(rowTotalUAH, venueCurrency).toLocaleString()} {currency}</b>
                                  </div>
                              )}</div>
                              <label className={styles.switch}>
                                  <input
                                      type="checkbox"
                                      checked={state.active}
                                      onChange={() => setServiceStates((p: any) => ({
                                          ...p,
                                          [s.id]: {active: !p[s.id]?.active, qty: p[s.id]?.qty || 1}
                                      }))}
                                  />
                                  <span className={styles.slider}></span>
                              </label>
                          </div>
                      </div>

                  </div>
              );
          })}
        </div>
      ))}
    </div>
  );
};

export default OrderExtraServicesComponent;