// import { useState, useMemo } from "react";
//
// export interface ServiceState {
//   active: boolean;
//   qty: number;
// }
//
// export const useOrderPricing = (extraServices: any[]) => {
//
//   const [guestCount, setGuestCount] = useState(1);
//   const [nightCount, setNightCount] = useState(1);
//
//   const [serviceStates, setServiceStates] = useState<
//     Record<number, ServiceState>
//   >({});
//
//   const [logisticsTotal, setLogisticsTotal] = useState(0);
//
//   const servicesTotal = useMemo(() => {
//     return extraServices.reduce((sum, item) => {
//       const state = serviceStates[Number(item.id)];
//       if (!state?.active) return sum;
//       const price = Number(item.price) || 0;
//       const qty = Number(state.qty) || 1;
//       if (item.service_type === "insurance") {
//         return sum + (price * guestCount);
//       }
//       if (item.price_type === "per_day") {
//         return sum + (price * nightCount * guestCount);
//       }
//
//
//       return sum + (price * qty);
//     }, 0);
//   }, [extraServices, serviceStates, guestCount, nightCount]);
//
//
//   const totalAmount = logisticsTotal + servicesTotal;
//
//   return {
//     guestCount,
//     setGuestCount,
//     nightCount,
//     setNightCount,
//     serviceStates,
//     setServiceStates,
//     logisticsTotal,
//     setLogisticsTotal,
//     servicesTotal,
//     totalAmount
//   };
// };


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
      console.log("Item:", item.name, "price:", item.price, "state:", state, "guestCount:", guestCount, "nightCount:", nightCount);
      if (item.service_type === "insurance") {
        return sum + (price * guestCount);
      }
      if (item.price_type === "per_day") {
        return sum + (price * nightCount * guestCount);
      }


      return sum + (price * qty);
    }, 0);
 console.log("HOOK LOG → totalInVenueCurrency:", totalInVenueCurrency, "venueCurrency:", venueCurrency);
    console.log("HOOK LOG → currency:", currency);

      return convert(totalInVenueCurrency, venueCurrency, currency);
  }, [extraServices, serviceStates, guestCount, nightCount, currency, venueCurrency, rates]);

console.log("HOOK STATE → serviceStates:", serviceStates);
  console.log("HOOK STATE → logisticsTotal:", logisticsTotal);
  console.log("HOOK STATE → servicesTotal:", servicesTotal);
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