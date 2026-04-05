"use client";

import React, {useEffect, useState, useCallback, useMemo} from "react";
import styles from "./OrdersVisitorComponent.module.css";
import { useUser } from "@/app/contexts/UserProvider";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import { IOrder } from "@/models/IOrder";
import { OrderItemComponent } from "@/components/order-item-component/OrderItemComponent";
import venueServices from "@/lib/services/venueService";
import {AxiosResponse} from "axios";

export const OrdersVisitorComponent = () => {
    const {user} = useUser();
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        if (!user?.token) return;
        try {
            setLoading(true);
            setError(null);
            const response: AxiosResponse = await venueServices.orders({accessToken: user.token}).list();
            console.log("DEBUG: Raw data from server:", response);
            const data = Array.isArray(response.data)
                ? response.data
                : (response.data?.data || []);
            const confirmedOnly = data.filter((order: IOrder) =>
                order.status?.toUpperCase() === "CONFIRMED"
            );
            setOrders(confirmedOnly);
        } catch (err: any) {
            setError("Could not load your VIP history. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [user?.token]);

    useEffect(() => {
        void fetchOrders();
    }, [fetchOrders]);

    const {personalOrders, workOrders} = useMemo(() => {
        if (!user) return {personalOrders: [], workOrders: []};

        const personal = orders.filter(order => {
            const orderUserId = typeof order.user === 'object' ? order.user?.id : order.user;
            return String(orderUserId) === String(user.id);
        });

        const work = orders.filter(order => {
            const isPersonal = personal.some(p => p.id === order.id);
            if (user.role === "admin") return !isPersonal;
            if (user.role === "venue_admin") {
                return !isPersonal;
            }


            return false;
        });

        return {personalOrders: personal, workOrders: work};
    }, [orders, user]);

    if (loading && orders.length === 0) return <LoaderComponent/>;

    if (error) return (
        <div className={styles.errorCard}>
            <p>{error}</p>
            <button onClick={() => void fetchOrders()} className={styles.retryBtn}>Retry</button>
        </div>
    );

    return (
        <div className={styles.pageWrapper}>
            {orders.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No activity records found.</p>
                </div>
            ) : (
                <div className={styles.sectionsContainer}>
                    {personalOrders.length > 0 && (
                        <div className={styles.orderSection}>
                            <h2 className={styles.sectionHeader}>My Orders</h2>
                            <div className={styles.ordersGrid}>
                                {personalOrders.map((order) => (
                                    <OrderItemComponent
                                        key={order.id}
                                        order={order}
                                        onUpdate={fetchOrders}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {workOrders.length > 0 && (
                        <div className={`${styles.orderSection} ${styles.workArea}`}>
                            <h2 className={styles.sectionHeader}>
                                {user?.role === "admin" ? "Global Management" : "Venue Operations"}
                            </h2>
                            <div className={styles.ordersGrid}>
                                {workOrders.map((order) => (
                                    <OrderItemComponent
                                        key={order.id}
                                        order={order}
                                        onUpdate={fetchOrders}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}