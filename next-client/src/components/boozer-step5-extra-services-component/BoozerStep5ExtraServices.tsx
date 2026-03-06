"use client";

import React, { useState, useEffect } from "react";
import styles from "./BoozerStep5ExtraServices.module.css";
import { useUser } from "@/app/contexts/UserProvider";
import axios from "axios";

interface IExtraService {
    id: number;
    name: string;
    description: string;
    price: number;
    price_type: 'fixed' | 'per_guest' | 'per_hour';
    service_type: string;
}

interface Props {
    venueId: string;
    orderId: number;
    onNext: () => void;
    onBack: () => void;
}

const BoozerStep5ExtraServices: React.FC<Props> = ({ venueId, orderId, onNext, onBack }) => {
    const { user } = useUser();
    const [availableServices, setAvailableServices] = useState<IExtraService[]>([]);
    const [selectedServices, setSelectedServices] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!user?.token) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/venues/${venueId}/extra_services/`, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(res => res.json())
        .then(data => {
            setAvailableServices(data.data || data || []);
            setLoading(false);
        })
        .catch(err => {
            console.error("Error fetching extra services:", err);
            setLoading(false);
        });
    }, [venueId, user?.token]);

    const updateServiceQty = (id: number, delta: number) => {
        setSelectedServices(prev => ({
            ...prev,
            [id]: Math.max(0, (prev[id] || 0) + delta)
        }));
    };

    const handleNext = async () => {
        setIsSubmitting(true);
        const extra_services = Object.entries(selectedServices)
            .filter(([_, qty]) => qty > 0)
            .map(([id, qty]) => ({
                service: parseInt(id),
                quantity: qty
            }));

        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/`, {
                extra_services: extra_services
            }, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            onNext();
        } catch (err) {
            console.error("Failed to add extra services:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className={styles.loader}>Loading special offers... 🥂</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Step 5: Extra Services 🛡️🎂</h2>
                <p>Make your even better!</p>
            </div>

            <div className={styles.servicesList}>
                {availableServices.length > 0 ? (
                    availableServices.map(service => (
                        <div key={service.id} className={styles.serviceCard}>
                            <div className={styles.info}>
                                <h4>{service.name}</h4>
                                <p className={styles.desc}>{service.description}</p>
                                <span className={styles.priceTag}>
                                    {service.price} UAH ({service.price_type.replace('_', ' ')})
                                </span>
                            </div>

                            <div className={styles.controls}>
                                <button onClick={() => updateServiceQty(service.id, -1)}>-</button>
                                <span>{selectedServices[service.id] || 0}</span>
                                <button onClick={() => updateServiceQty(service.id, 1)}>+</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={styles.empty}>No extra services available for this venue.</p>
                )}
            </div>

            <div className={styles.actions}>
                <button onClick={onBack} disabled={isSubmitting}>Back</button>
                <button
                    className={styles.nextBtn}
                    onClick={handleNext}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Saving..." : "Next: Route & Final Summary ➔"}
                </button>
            </div>
        </div>
    );
};

export default BoozerStep5ExtraServices;
