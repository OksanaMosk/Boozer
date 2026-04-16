"use client";

import React, {useEffect, useState, useCallback} from "react";
import styles from "./OrdersVisitorComponent.module.css";
import { useUser } from "@/app/contexts/UserProvider";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import { IOrder } from "@/models/IOrder";
import { OrderItemComponent } from "@/components/order-item-component/OrderItemComponent";
import venueServices from "@/lib/services/venueService";
import {AxiosResponse} from "axios";
import {PaginationComponent} from "@/components/pagination-component/PaginationComponent";
import {useSearchParams} from "next/navigation";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import {ButtonScrollBottomComponent} from "@/components/button-scroll-bottom-component/ButtonScrollBottomComponent";

export const OrdersVisitorComponent = () => {
    const {user} = useUser();
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get("page") || "1");
    const [totalPages, setTotalPages] = useState(1);

    const fetchOrders = useCallback(async () => {
    if (!user?.token) return;
    try {
        setLoading(true);
        setError(null);
        setOrders([]);
        const response: AxiosResponse = await venueServices
            .orders({accessToken: user.token})
            .list({
                page: currentPage,
                 user: user.id,
                ordering: '-id'
            });

        const data = response.data?.data || [];
        const pages = response.data?.total_pages || 1;

        setOrders(data);
        setTotalPages(pages);
    } catch (err: any) {

        if (err.response?.status === 404) {
            setOrders([]);
            setTotalPages(1);
        } else {
            setError("Could not load your history.");
        }
    } finally {
        setLoading(false);
    }
}, [user?.token, currentPage]);

    useEffect(() => {
        void fetchOrders();
    }, [fetchOrders]);


    if (loading) return <LoaderComponent/>;

    if (error) return (
        <div className={styles.errorCard}>
            <p>{error}</p>
            <button onClick={() => void fetchOrders()} className={styles.retryBtn}>Retry</button>
        </div>
    );

    return (
        <div className={styles.pageWrapper}>
            <ButtonScrollBottomComponent/>
            {orders.length === 0 ? (
                <div className={styles.emptyState}>
                    <p className={styles.titleNo}>No activity records found.</p>
                </div>
            ) : (
                <>
                    <h2 className={styles.sectionHeader}>Orders</h2>
                    <div className={styles.ordersGrid}>
                        {orders.map((order) => (
                            <OrderItemComponent
                                key={order.id}
                                order={order}
                                onUpdate={fetchOrders}
                            />
                        ))}
                    </div>
                </>
            )}

            {totalPages > 1 && (
                <div className={styles.paginationWrapper}>
                    <PaginationComponent totalPages={totalPages}/>
                </div>
            )}
            <ButtonScrollTopComponent/>
        </div>
    );
}
