"use client";

"use client";

import React, { useState, useEffect } from "react";
import styles from "./BoozerStep5ExtraServices.module.css";
import { useUser } from "@/app/contexts/UserProvider";
import { AxiosResponse } from "axios";
import venueServices from "@/lib/services/venueService";

interface IExtraService {
    id: number;
    name: string;
    description: string;
    price: number;
    price_type: 'fixed' | 'per_guest' | 'per_hour' | 'per_day';
    service_type: string;
    currency?: string;
}

interface ITravelLogistics {
    step_type: string;
    price_per_km: number;
    currency: string;
}

interface Props {
    venueId: string;
    orderId: number;
    onNext: (id: number) => void;
    onBack: () => void;
}

const BoozerStep5ExtraServices: React.FC<Props> = ({ venueId, orderId, onNext, onBack }) => {
    const { user } = useUser();
    const [availableServices, setAvailableServices] = useState<IExtraService[]>([]);
    const [logistics, setLogistics] = useState<ITravelLogistics[]>([]);
    const [selectedServices, setSelectedServices] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    const token = user?.token ? { accessToken: user.token } : undefined;

    useEffect(() => {
        if (!token || !venueId) return;
        const fetchData = async () => {
            try {
                const [logRes, servRes]: AxiosResponse[] = await Promise.all([
                    venueServices.venues.travelLogistics(token)(venueId).getAll(),
                    venueServices.venues.extraServices(token)(venueId).getAll()
                ]);

                setLogistics(logRes.data.data || []);
                setAvailableServices(servRes.data.data || []);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setLoading(false);
            }
        };
        void fetchData();
    }, [venueId, user?.token]);

    const updateServiceQty = (id: number, delta: number) => {
        setSelectedServices(prev => ({
            ...prev,
            [id]: Math.max(0, (prev[id] || 0) + delta)
        }));
    };

    const handleNext = async () => {
        if (!user?.token) return;
        setIsSubmitting(true);

        const extra_services_payload = Object.entries(selectedServices)
            .filter(([_, qty]) => qty > 0)
            .map(([id, qty]) => ({ service: parseInt(id), quantity: qty }));
        try {
            const response: AxiosResponse = await venueServices.venues
                .orders({ accessToken: user.token })(venueId.toString())
                .update(orderId, {
                extra_services: extra_services_payload
            });

            if (response.data) {
                onNext(Number(response.data.id || orderId));
            }
        } catch (err) {
            console.error("Update order error:", err);
            setMessage("Error updating services");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className={styles.loader}>Loading special offers... 🥂</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Step 5: Extra Services & Logistics 🛡️🎂</h2>
                <p>Make your event even better!</p>
            </div>

            <div className={styles.servicesList}>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Transport Rates</h3>
                {logistics.map((item) => (
                    <div key={item.step_type} className={styles.serviceCard} style={{ borderLeft: '4px solid #6366f1' }}>
                        <div className={styles.info}>
                            <h4 className="capitalize">{item.step_type.replace('_', ' ')}</h4>
                            <p className={styles.desc}>Automatic route calculation</p>
                            <span className={styles.priceTag}>
                                {item.price_per_km} {item.currency}/km
                            </span>
                        </div>
                    </div>
                ))}

                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mt-8 mb-4 ml-2">Available Services</h3>
                {availableServices.length > 0 ? (
                    availableServices.map(service => (
                        <div key={service.id} className={styles.serviceCard}>
                            <div className={styles.info}>
                                <h4 className="capitalize">{service.name}</h4>
                                <p className={styles.desc}>{service.description || `Special offer`}</p>
                                <span className={styles.priceTag}>
                                    {service.price} {service.currency || 'UAH'} ({service.price_type.replace('_', ' ')})
                                </span>
                            </div>

                            <div className={styles.controls}>
                                <button onClick={() => updateServiceQty(service.id, -1)} disabled={isSubmitting}>-</button>
                                <span>{selectedServices[service.id] || 0}</span>
                                <button onClick={() => updateServiceQty(service.id, 1)} disabled={isSubmitting}>+</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={styles.empty}>No extra services found.</p>
                )}
            </div>

            <div className={styles.actions}>
                <button onClick={onBack} disabled={isSubmitting}>Back</button>
                <button className={styles.nextBtn} onClick={handleNext} disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Next: Route & Final Summary ➔"}
                </button>
            </div>
            {message && <p className={styles.errorMessage} style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{message}</p>}
        </div>
    );
};

export default BoozerStep5ExtraServices;




// "use client";
//
// import React, { useState, useEffect } from "react";
// import styles from "./BoozerStep5ExtraServices.module.css";
// import { useUser } from "@/app/contexts/UserProvider";
// import axios from "axios";
//
// interface IExtraService {
//     id: number;
//     name: string;
//     description: string;
//     price: number;
//     price_type: 'fixed' | 'per_guest' | 'per_hour';
//     service_type: string;
// }
//
// interface Props {
//     venueId: string;
//     orderId: number;
//     onNext: () => void;
//     onBack: () => void;
// }
//
// const BoozerStep5ExtraServices: React.FC<Props> = ({ venueId, orderId, onNext, onBack }) => {
//     const { user } = useUser();
//     const [availableServices, setAvailableServices] = useState<IExtraService[]>([]);
//     const [selectedServices, setSelectedServices] = useState<Record<number, number>>({});
//     const [loading, setLoading] = useState(true);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//
//     useEffect(() => {
//         if (!user?.token) return;
//         fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/venues/${venueId}/extra_services/`, {
//             headers: { Authorization: `Bearer ${user.token}` }
//         })
//         .then(res => res.json())
//         .then(data => {
//             setAvailableServices(data.data || data || []);
//             setLoading(false);
//         })
//         .catch(err => {
//             console.error("Error fetching extra services:", err);
//             setLoading(false);
//         });
//     }, [venueId, user?.token]);
//
//     const updateServiceQty = (id: number, delta: number) => {
//         setSelectedServices(prev => ({
//             ...prev,
//             [id]: Math.max(0, (prev[id] || 0) + delta)
//         }));
//     };
//
//     const handleNext = async () => {
//         setIsSubmitting(true);
//         const extra_services = Object.entries(selectedServices)
//             .filter(([_, qty]) => qty > 0)
//             .map(([id, qty]) => ({
//                 service: parseInt(id),
//                 quantity: qty
//             }));
//
//         try {
//             await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/`, {
//                 extra_services: extra_services
//             }, {
//                 headers: { Authorization: `Bearer ${user?.token}` }
//             });
//             onNext();
//         } catch (err) {
//             console.error("Failed to add extra services:", err);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };
//
//     if (loading) return <div className={styles.loader}>Loading special offers... 🥂</div>;
//
//     return (
//         <div className={styles.container}>
//             <div className={styles.header}>
//                 <h2>Step 5: Extra Services 🛡️🎂</h2>
//                 <p>Make your even better!</p>
//             </div>
//
//             <div className={styles.servicesList}>
//                 {availableServices.length > 0 ? (
//                     availableServices.map(service => (
//                         <div key={service.id} className={styles.serviceCard}>
//                             <div className={styles.info}>
//                                 <h4>{service.name}</h4>
//                                 <p className={styles.desc}>{service.description}</p>
//                                 <span className={styles.priceTag}>
//                                     {service.price} UAH ({service.price_type.replace('_', ' ')})
//                                 </span>
//                             </div>
//
//                             <div className={styles.controls}>
//                                 <button onClick={() => updateServiceQty(service.id, -1)}>-</button>
//                                 <span>{selectedServices[service.id] || 0}</span>
//                                 <button onClick={() => updateServiceQty(service.id, 1)}>+</button>
//                             </div>
//                         </div>
//                     ))
//                 ) : (
//                     <p className={styles.empty}>No extra services available for this venue.</p>
//                 )}
//             </div>
//
//             <div className={styles.actions}>
//                 <button onClick={onBack} disabled={isSubmitting}>Back</button>
//                 <button
//                     className={styles.nextBtn}
//                     onClick={handleNext}
//                     disabled={isSubmitting}
//                 >
//                     {isSubmitting ? "Saving..." : "Next: Route & Final Summary ➔"}
//                 </button>
//             </div>
//         </div>
//     );
// };
//
// export default BoozerStep5ExtraServices;
