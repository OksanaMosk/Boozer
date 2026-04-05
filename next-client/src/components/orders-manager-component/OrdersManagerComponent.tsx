"use client";

import React, {useEffect, useState, useCallback, useMemo} from "react";
import { useParams } from "next/navigation";
import styles from "./OrdersManagerComponent.module.css";
import { useUser } from "@/app/contexts/UserProvider";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import { IOrder } from "@/models/IOrder";
import { OrderItemComponent } from "@/components/order-item-component/OrderItemComponent";
import venueServices from "@/lib/services/venueService";

interface OrdersManagerProps {
    venueId?: number | string;
}
export const OrdersManagerComponent = ({ venueId: propsVenueId }: OrdersManagerProps) => {
    const { user } = useUser();
    const params = useParams();
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const activeVenueId = useMemo(() => {
        const id = propsVenueId ?? params?.id;
         return id ? String(id) : undefined;
    }, [propsVenueId, params?.id]);


    const fetchVenueOrders = useCallback(async () => {
        if (!user?.token || !activeVenueId) return;

        try {
            setLoading(true);
            setError(null);
            const { data } = await venueServices.venues
                .orders({ accessToken: user.token })(activeVenueId)
                .getAll();

            const result = Array.isArray(data) ? data : (data.data || []);
            setOrders(result);
        } catch (err) {
            setError("Failed to sync venue orders.");
        } finally {
            setLoading(false);
        }
    }, [user?.token, activeVenueId]);

    useEffect(() => {
      void fetchVenueOrders();
    }, [fetchVenueOrders]);

    if (loading && orders.length === 0) return <LoaderComponent />;

    return (
        <div className={styles.pageWrapper}>
            <header className={styles.title}>
                <h1 className={styles.sectionHeader}>Manage Orders</h1>
                <p className={styles.subHeader}>Orders for Venue ID: <strong>#{activeVenueId}</strong></p>
            </header>

            {error ? (
                <div className={styles.list}>
                    <p>{error}</p>
                    <button onClick={() => void fetchVenueOrders()} className={styles.retryBtn}>Retry Sync</button>
                </div>
            ) : orders.length === 0 ? (
                <div className={styles.list}>
                    <p>No active orders found for this location.</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {orders.map((order) => (
                        <OrderItemComponent
                            key={order.id}
                            order={order}
                            venueId={activeVenueId}
                            onUpdate={fetchVenueOrders}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
