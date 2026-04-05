"use client";

import React, { useEffect, useState } from "react";
import styles from "./AnalyticsManagerComponent.module.css";
import { useUser } from "@/app/contexts/UserProvider";
import venueService from "@/lib/services/venueService";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import { IVenueStatsResponse } from "@/models/IOrder";
import {AxiosResponse} from "axios";

export const AnalyticsManagerComponent = ({ venueId }: { venueId: string }) => {
    const { user } = useUser();
    const [data, setData] = useState<IVenueStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!user?.token) return;
             setLoading(true);
        setError(null);
            try {
                const response:AxiosResponse = await venueService.venues.ordersStats(venueId, { accessToken: user.token });
                setData(response.data);
            } catch (err: any) {
            if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred while loading financial data.");
            }
            } finally {
                setLoading(false);
            }
        };
        void loadData();
    }, [venueId, user?.token]);

    if (loading) return <LoaderComponent />;
    if (error) return (
    <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
            <h3 className={styles.errorTitle}>Analytics Unavailable</h3>
            <p className={styles.errorMessage}>{error}</p>
            <button onClick={() => window.location.reload()} className={styles.retryBtn}>
                Retry Access
            </button>
        </div>
    </div>
);

if (!data) return <div className={styles.noData}>No financial records found for this venue.</div>;

    const { stats, orders } = data;

    return (
        <div className={styles.container}>
            <h1 className={styles.titleManage}>Venue Analytics & Insights</h1>
            <div className={styles.statsFlex}>
                <div className={styles.statCard}>
                    <p className={styles.statLabel}>Total Revenue</p>
                    <h2 className={styles.statValue}>
                        {stats.total_revenue.toLocaleString()} <span>{stats.currency}</span>
                    </h2>
                </div>

                <div className={styles.statCard}>
                    <p className={styles.statLabel}>Average Check</p>
                    <h2 className={styles.statValue}>
                        {stats.average_check.toLocaleString()} {stats.currency}
                    </h2>
                </div>

                <div className={styles.statCard}>
                    <p className={styles.statLabel}>Successful Orders</p>
                    <h2 className={styles.statValue}>
                        {stats.success_orders_count} / {stats.total_orders_count}
                    </h2>
                </div>
            </div>

            <div className={styles.analyticsFlex}>
                <div className={styles.budgetBox}>
                    <h3 className={styles.boxTitle}>Budget Distribution</h3>
                    <div className={styles.progressList}>
                        {stats.budget_distribution.map((b) => (
                            <div key={b.budget_range} className={styles.progressItem}>
                                <div className={styles.progressInfo}>
                                    <span>{b.budget_range} {stats.currency}</span>
                                    <span>{b.count}</span>
                                </div>
                                <div className={styles.progressTrack}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${(b.count / stats.total_orders_count) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.audienceBox}>
                    <h3 className={styles.boxTitle}>Guest Portrait</h3>
                    <div className={styles.genderFlex}>
                        {stats.gender_distribution.map((g) => (
                            <div key={g.gender_preference} className={styles.genderCard}>
                                <span className={styles.gLabel}>{g.gender_preference}</span>
                                <span className={styles.gValue}>{g.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.ordersWrapper}>
                <h3 className={styles.sectionTitle}>Order History</h3>
                <div className={styles.listHeaderFlex}>
                    <div className={styles.colDetails}>Guest Details</div>
                    <div className={styles.colStatus}>Status</div>
                    <div className={styles.colPrefs}>Preferences</div>
                    <div className={styles.colImpact}>Impact</div>
                </div>
                {orders.length === 0 ? (
                    <p className={styles.emptyOrders}>No orders yet.</p>
                ) : (
                    <ul className={styles.ordersUl}>
                        {orders.map((order) => (
                            <li key={order.id} className={styles.orderLi}>

                            <div className={styles.colDetails}>
                                <span className={styles.goldId}>#{order.id}</span>
                                <div className={styles.guestMeta}>
                                    <p className={styles.guestCity}>{order.user_city || "Private Guest"}</p>
                                    <p className={styles.orderPeriod}>
                                        {order.start_date ? new Date(order.start_date).toLocaleDateString("uk-UA") : "—"}
                                        {order.end_date && ` - ${new Date(order.end_date).toLocaleDateString("uk-UA")}`}
                                    </p>
                                </div>
                            </div>

                            <div className={styles.colStatus}>
                                <span className={`${styles.statusBadge} ${styles[order.status?.toLowerCase() || 'pending']}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className={styles.colPrefs}>
                                <div className={styles.tagFlex}>
                                    {order.gender_preference && <span className={styles.miniTag}>{order.gender_preference}</span>}
                                    {order.payment_type && <span className={styles.miniTag}>Pay: {order.payment_type.split(' ')[0]}</span>}
                                </div>
                            </div>

                            <div className={styles.colImpact}>
                                <div className={styles.priceFlex}>
                                    <p className={styles.mainPrice}>
                                        {order.venue_impact} <span>{data.stats.currency}</span>
                                    </p>
                                    {order.currency !== data.stats.currency && (
                                        <p className={styles.altPrice}>
                                            {order.total_price} {order.currency}
                                        </p>
                                    )}
                                </div>
                            </div>

                        </li>
                    ))}
                </ul>)}
            </div>
        </div>
    );
};
