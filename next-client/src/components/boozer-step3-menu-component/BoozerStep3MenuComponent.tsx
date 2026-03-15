"use client";

import React, { useState, useEffect } from "react";
import styles from "./BoozerStep3MenuComponent.module.css";
import venueServices from "@/lib/services/venueService";
import { useUser } from "@/app/contexts/UserProvider";
import {AxiosResponse} from "axios";
import { exchangeService } from "@/lib/services/exchangeService";
import {ButtonScrollBottomComponent} from "@/components/button-scroll-bottom-component/ButtonScrollBottomComponent";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import {OrderStatusType} from "@/models/IOrder";

interface IMenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    photo_menu_item?: string;
    category: string;
}

interface Props {
    venueId: string;
    orderId: number;
    onNext: (orderId: number) => void;
    onBack: () => void;
}

const BoozerStep3MenuComponent: React.FC<Props> = ({venueId, orderId, onNext, onBack}) => {
    const {user} = useUser();
    const [menuList, setMenuList] = useState<string[]>([]);
    const [groupedItems, setGroupedItems] = useState<Record<string, IMenuItem[]>>({});
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [cart, setCart] = useState<Record<string, number>>({});
    const [currency, setCurrency] = useState<"UAH" | "USD" | "EUR">("UAH");
    const [venueCurrency, setVenueCurrency] = useState<"UAH" | "USD" | "EUR">("UAH");
    const [rates, setRates] = useState<{ USD: number; EUR: number }>({USD: 1, EUR: 1});
    if (!user) {
        return <p className={styles.errorText}>Please log in.</p>;
    }

   const getConverted = (amount: number, itemCurrency: string) => {
    if (currency === itemCurrency) return amount;
    if (itemCurrency === "UAH") {
        const rate = currency === "USD" ? rates.USD : rates.EUR;
        return +(amount / rate).toFixed(2);
    }
    if (itemCurrency === "USD") {
        const rate = currency === "UAH" ? rates.USD : (currency === "EUR" ? rates.USD / rates.EUR : 1);
        return +(amount * rate).toFixed(2);
    }
    if (itemCurrency === "EUR") {
        const rate = currency === "UAH" ? rates.EUR : (currency === "USD" ? rates.EUR / rates.USD : 1);
        return +(amount * rate).toFixed(2);
    }
    return amount;
};

    const addPortion = (id: string) => {
        setCart((prev) => ({...prev, [id]: (prev[id] || 0) + 1}));
    };

    const removePortion = (id: string) => {
        setCart((prev) => {
            const copy = {...prev};
            if (copy[id] > 1) copy[id] -= 1;
            else delete copy[id];
            return copy;
        });
    };

    const getItemTotal = (item: IMenuItem) => (cart[item.id] || 0) * item.price;
    const categoryItems = React.useMemo(
        () => Object.values(groupedItems).flat(),
        [groupedItems]
    );
    const total = Object.entries(cart).reduce((sum, [id, count]) => {
        const item = categoryItems.find(
            (i) => i.id != null && String(i.id) === id
        );
        return item ? sum + count * Number(item.price) : sum;
    }, 0).toFixed(2);

    useEffect(() => {
        const fetchMenu = async () => {
            setLoading(true);
            try {
                if (!venueId || !user?.token) return;
                const response = await venueServices.venues.menu({accessToken: user.token})(String(venueId)).getAll();
                const menus = response.data?.data ?? [];

                const firstItem = menus.flatMap((menu: any) => menu.items || [])[0];
                if (firstItem?.currency) {
                    setVenueCurrency(firstItem.currency);
                    setCurrency(firstItem.currency);
                }

                const allItems = menus.flatMap((menu: any) => menu.items || []);
                const grouped = allItems.reduce(
                    (acc: Record<string, IMenuItem[]>, item: IMenuItem) => {
                        const category = item.category || "other";
                        if (!acc[category]) acc[category] = [];
                        acc[category].push(item);
                        return acc;
                    },
                    {}
                );
                const CATEGORY_ORDER = ["mains", "salads", "soups", "drinks", "desserts"];
                const orderedCategories = CATEGORY_ORDER.filter(cat => grouped[cat])
                    .concat(Object.keys(grouped).filter(cat => !CATEGORY_ORDER.includes(cat)));
                setGroupedItems(grouped);
                setMenuList(orderedCategories);
            } catch (err) {
                setMessage("Failed to load menu");
            } finally {
                setLoading(false);
            }
        };
        void fetchMenu();
    }, [venueId, user?.token]);

    useEffect(() => {
        const initExchange = async () => {
            if (user?.token) {
                try {
                    const data = await exchangeService.init(user.token);
                    setRates(data);
                } catch (err) {
                    console.error("Exchange init error:", err);
                }
            }
        };
        void initExchange();
    }, [user?.token]);

    const handleNextStep = async () => {
        setIsSubmitting(true);

        const payload = {
            items: Object.entries(cart).map(([id, qty]) => ({
                menu_item: parseInt(id),
                quantity: qty
            })),
            status: "HOLD" as OrderStatusType
        };
        console.log("PAYLOAD3:", payload);

        try {
            if (!user?.token) return
            const response: AxiosResponse = await venueServices.venues
                .orders({accessToken: user.token})(venueId.toString())
                .update(orderId, (payload))

            if (response.data && response.data.id) {
                onNext(Number(response.data.id));
            }
        } catch (err) {
            setMessage("Error updating order items");
        } finally {
            setIsSubmitting(false)
        }
    }
    if (loading) return <div className={styles.loader}><LoaderComponent/></div>;

    return (
        <div className={styles.orderWrapper}>
            <h2 className={styles.title}>Step 3:</h2>
            <ButtonScrollBottomComponent/>
            <div className={styles.group}>
                <div className={styles.wrapperTitle}>
                    <h4 className={styles.bigText}>Menu</h4>
                    <p className={styles.smallText}>Select</p>
                </div>
                <div className={styles.selectCurrency}>
                    <label className={styles.label}>Currency</label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value as any)}  className={styles.select}>
                        <option value="UAH">UAH</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                    </select>
                </div>
                {menuList.length === 0 ? (
                    <div className={styles.emptyMenu}>
                        <p className={styles.subTitle} style={{textAlign: 'center', marginTop: '20px'}}>
                            Unfortunately, the menu is currently unavailable.
                        </p>
                    </div>
                ) : (menuList.map((category) => (
                    <div key={category} className={styles.categoryWrapper}>
                        <h5 className={styles.subTitle}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </h5>

                        <div className={styles.categoryGroup}>
                            {(groupedItems[category] || []).map((item) => (
                                <div key={item.id} className={styles.item}>
                                    <div className={styles.plate}>
                                        <img src={item.photo_menu_item || "/images/noPosterMenu.webp"} alt={item.name}
                                             className={styles.photoImage}/>
                                    </div>
                                    <div className={styles.itemDetail}>
                                        <strong className={styles.titleMenu}>{item.name}</strong>
                                        <p className={styles.about}>{item.description}</p>
                                        <p className={styles.price}>{getConverted(item.price, item.currency)} {currency}</p>

                                        <div className={styles.itemControls}>
                                            <button onClick={() => removePortion(item.id)} className={styles.qtyBtn}>-
                                            </button>
                                            <span className={styles.quantity}>{cart[item.id] || 0}</span>
                                            <button onClick={() => addPortion(item.id)} className={styles.qtyBtn}>+
                                            </button>
                                            <span className={styles.itemTotal}>
                                                    {getConverted(getItemTotal(item), item.currency).toFixed(2)} {currency}
                                            </span>

                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )))}</div>

            <div className={styles.orderSummary}>
                <div className={styles.totalValue}>
                    <p>Grand Total:</p>
                    <p>
                        {getConverted(Number(total), categoryItems.find(i => cart[i.id])?.currency || venueCurrency)} {currency}
                    </p>
                </div>

                <div className={styles.actions}>
                    <button onClick={onBack} className={styles.buttonPrev} disabled={isSubmitting}>Back</button>
                    <button
                        onClick={handleNextStep}
                        className={styles.buttonNext}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ?
                            <div className={`authButton ${styles.loaderWrapper}`}>
                                <LoaderComponent/>
                            </div>
                            :
                            "Next"
                        }
                    </button>
                </div>
            </div>
            {message && <p className={styles.errorMessage}>{message}</p>}
        </div>
    );
};

export default BoozerStep3MenuComponent;


// "use client";
//
// import React, { useState, useEffect } from "react";
// import styles from "./BoozerStep3MenuComponent.module.css";
// import venueServices from "@/lib/services/venueService";
// import { useUser } from "@/app/contexts/UserProvider";
// import {AxiosResponse} from "axios";
// import { exchangeService } from "@/lib/services/exchangeService";
// import {ButtonScrollBottomComponent} from "@/components/button-scroll-bottom-component/ButtonScrollBottomComponent";
// import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
// import {OrderStatusType} from "@/models/IOrder";
//
// interface IMenuItem {
//     id: string;
//     name: string;
//     description: string;
//     price: number;
//     currency: string;
//     photo_menu_item?: string;
//     category: string;
// }
//
// interface Props {
//     venueId: string;
//     orderId: number;
//     onNext: (orderId: number) => void;
//     onBack: () => void;
// }
//
// const BoozerStep3MenuComponent: React.FC<Props> = ({venueId, orderId, onNext, onBack}) => {
//     const {user} = useUser();
//     const [menuList, setMenuList] = useState<string[]>([]);
//     const [groupedItems, setGroupedItems] = useState<Record<string, IMenuItem[]>>({});
//     const [loading, setLoading] = useState(true);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [message, setMessage] = useState("");
//     const [cart, setCart] = useState<Record<string, number>>({});
//     const [currency, setCurrency] = useState<"UAH" | "USD" | "EUR">("UAH");
//     const [rates, setRates] = useState<{ USD: number; EUR: number }>({USD: 1, EUR: 1});
//     if (!user) {
//         return <p className={styles.errorText}>Please log in.</p>;
//     }
//
//     const getConverted = (amount: number) => {
//         if (currency === "UAH") return amount;
//         const rate = currency === "USD" ? rates.USD : rates.EUR;
//         return +(amount / rate).toFixed(2);
//     };
//     const addPortion = (id: string) => {
//         setCart((prev) => ({...prev, [id]: (prev[id] || 0) + 1}));
//     };
//
//     const removePortion = (id: string) => {
//         setCart((prev) => {
//             const copy = {...prev};
//             if (copy[id] > 1) copy[id] -= 1;
//             else delete copy[id];
//             return copy;
//         });
//     };
//
//     const getItemTotal = (item: IMenuItem) => (cart[item.id] || 0) * item.price;
//     const categoryItems = React.useMemo(
//         () => Object.values(groupedItems).flat(),
//         [groupedItems]
//     );
//     const total = Object.entries(cart).reduce((sum, [id, count]) => {
//         const item = categoryItems.find(
//             (i) => i.id != null && String(i.id) === id
//         );
//         return item ? sum + count * Number(item.price) : sum;
//     }, 0).toFixed(2);
//
//     useEffect(() => {
//         const fetchMenu = async () => {
//             setLoading(true);
//             try {
//                 if (!venueId || !user?.token) return;
//                 const response = await venueServices.venues.menu({accessToken: user.token})(String(venueId)).getAll();
//                 const menus = response.data?.data ?? response.data ?? [];
//                 const allItems = menus.flatMap((menu: any) => menu.items || []);
//                 const grouped = allItems.reduce(
//                     (acc: Record<string, IMenuItem[]>, item: IMenuItem) => {
//                         const category = item.category || "other";
//                         if (!acc[category]) acc[category] = [];
//                         acc[category].push(item);
//                         return acc;
//                     },
//                     {}
//                 );
//                 const CATEGORY_ORDER = ["mains", "salads", "soups", "drinks", "desserts"];
//                 const orderedCategories = CATEGORY_ORDER.filter(cat => grouped[cat])
//                     .concat(Object.keys(grouped).filter(cat => !CATEGORY_ORDER.includes(cat)));
//                 setGroupedItems(grouped);
//                 setMenuList(orderedCategories);
//             } catch (err) {
//                 setMessage("Failed to load menu");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         void fetchMenu();
//     }, [venueId, user?.token]);
//
//     useEffect(() => {
//         const initExchange = async () => {
//             if (user?.token) {
//                 try {
//                     const data = await exchangeService.init(user.token);
//                     setRates(data);
//                 } catch (err) {
//                     console.error("Exchange init error:", err);
//                 }
//             }
//         };
//         void initExchange();
//     }, [user?.token]);
//
//     const handleNextStep = async () => {
//         setIsSubmitting(true);
//
//         const payload = {
//             items: Object.entries(cart).map(([id, qty]) => ({
//                 menu_item: parseInt(id),
//                 quantity: qty
//             })),
//             status: "HOLD" as OrderStatusType
//         };
//         console.log("PAYLOAD3:", payload);
//
//         try {
//             if (!user?.token) return
//             const response: AxiosResponse = await venueServices.venues
//                 .orders({accessToken: user.token})(venueId.toString())
//                 .update(orderId, (payload))
//
//             if (response.data && response.data.id) {
//                 onNext(Number(response.data.id));
//             }
//         } catch (err) {
//             setMessage("Error updating order items");
//         } finally {
//             setIsSubmitting(false)
//         }
//     }
//     if (loading) return <div className={styles.loader}><LoaderComponent/></div>;
//
//     return (
//         <div className={styles.orderWrapper}>
//             <h2 className={styles.title}>Step 3:</h2>
//             <ButtonScrollBottomComponent/>
//             <div className={styles.group}>
//                 <div className={styles.wrapperTitle}>
//                     <h4 className={styles.bigText}>Menu</h4>
//                     <p className={styles.smallText}>Select</p>
//                 </div>
//                 <div className={styles.selectCurrency}>
//                     <label className={styles.label}>Currency</label>
//                     <select value={currency} onChange={(e) => setCurrency(e.target.value as any)}  className={styles.select}>
//                         <option value="UAH">UAH</option>
//                         <option value="USD">USD</option>
//                         <option value="EUR">EUR</option>
//                     </select>
//                 </div>
//                 {menuList.length === 0 ? (
//                     <div className={styles.emptyMenu}>
//                         <p className={styles.subTitle} style={{textAlign: 'center', marginTop: '20px'}}>
//                             Unfortunately, the menu is currently unavailable.
//                         </p>
//                     </div>
//                 ) : (menuList.map((category) => (
//                     <div key={category} className={styles.categoryWrapper}>
//                         <h5 className={styles.subTitle}>
//                             {category.charAt(0).toUpperCase() + category.slice(1)}
//                         </h5>
//
//                         <div className={styles.categoryGroup}>
//                             {(groupedItems[category] || []).map((item) => (
//                                 <div key={item.id} className={styles.item}>
//                                     <div className={styles.plate}>
//                                         <img src={item.photo_menu_item || "/images/noPosterMenu.webp"} alt={item.name}
//                                              className={styles.photoImage}/>
//                                     </div>
//                                     <div className={styles.itemDetail}>
//                                         <strong className={styles.titleMenu}>{item.name}</strong>
//                                         <p className={styles.about}>{item.description}</p>
//                                         <p className={styles.price}>{getConverted(item.price)} {currency}</p>
//
//                                         <div className={styles.itemControls}>
//                                             <button onClick={() => removePortion(item.id)} className={styles.qtyBtn}>-
//                                             </button>
//                                             <span className={styles.quantity}>{cart[item.id] || 0}</span>
//                                             <button onClick={() => addPortion(item.id)} className={styles.qtyBtn}>+
//                                             </button>
//                                             <span
//                                                 className={styles.itemTotal}>{getConverted(getItemTotal(item))} {currency}</span>
//
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 )))}</div>
//
//             <div className={styles.orderSummary}>
//                 <div className={styles.totalValue}>
//                     <p>Grand Total:</p>
//                     <p>{getConverted(Number(total))} {currency}</p>
//                 </div>
//
//                 <div className={styles.actions}>
//                     <button onClick={onBack} className={styles.buttonPrev} disabled={isSubmitting}>Back</button>
//                     <button
//                         onClick={handleNextStep}
//                         className={styles.buttonNext}
//                         disabled={isSubmitting}
//                     >
//                         {isSubmitting ?
//                             <div className={`authButton ${styles.loaderWrapper}`}>
//                                 <LoaderComponent/>
//                             </div>
//                             :
//                             "Next"
//                         }
//                     </button>
//                 </div>
//             </div>
//             {message && <p className={styles.errorMessage}>{message}</p>}
//         </div>
//     );
// };
//
// export default BoozerStep3MenuComponent;
