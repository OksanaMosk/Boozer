"use client";

import React, { useEffect, useState } from "react";
import styles from "./BoozerStep7FinalComponent.module.css";
import { useUser } from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import { OrderStatusType, IOrder } from "@/models/IOrder";
import { AxiosResponse } from "axios";

interface Props {
    orderId: number;
    onReset: () => void;
    venueId: string;
}

const BoozerStep7Final: React.FC<Props> = ({ orderId, venueId, onReset }) => {
    const { user } = useUser();
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<IOrder | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!user?.token) return;
            try {
                const res: AxiosResponse<IOrder> = await venueServices.venues
                    .orders({ accessToken: user.token })(venueId)
                    .get(orderId);
                setOrder(res.data);

            } catch (e) {
                console.error("Failed to fetch final order data", e);
            }
        };
        void fetchOrder();
    }, [orderId, venueId, user?.token]);

    const handleFinalConfirm = async () => {
        setLoading(true);
        try {
            if (!user?.token) return;
            await venueServices.venues
                .orders({ accessToken: user.token })(venueId.toString())
                .update(orderId, { status: "CONFIRMED" as OrderStatusType });

            setIsConfirmed(true);
        } catch (err) {
            alert("Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <p className={styles.errorText}>Please log in.</p>;
    if (!order) return <LoaderComponent />;

    const rate = Number(order.exchange_rate) || 1;

    if (isConfirmed) {
        return (
            <div className={styles.successContainer}>
                <div className={styles.confetti}>
                    🎊
                    <img
                       src="/favicon/android-chrome-512x512.png"
                        width={100}
                        height={100}
                        className={styles.logoImage}
                        alt="VIP Icon"
                    />
                    🎊
                </div>

                <h1 className={styles.title}>Cheers!</h1>
                <h2 className={styles.title}>Your "VIP Boozer"</h2>
                 <h2 className={styles.title}>is Ready!</h2>
                <p className={styles.titleId}>Order <b>#{order.id}</b> is officially confirmed.</p>

                <div className={styles.receiptCard}>
                     <h3 className={styles.receiptTitle} >Official Receipt</h3>
                    <div className={styles.receiptHeader}>

                            {order.tables && order.tables.length > 0 && (() => {
                                const firstBooking = order.tables[0];
                                const range = typeof firstBooking.time_range === 'string'
                                    ? JSON.parse(firstBooking.time_range)
                                    : firstBooking.time_range;

                                const bookingDate = range?.lower
                                    ? new Date(range.lower).toLocaleDateString('uk-UA', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })
                                    : "";

                                const startTime = range?.lower
                                    ? new Date(range.lower).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
                                    : "";
                                const endTime = range?.upper
                                    ? new Date(range.upper).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
                                    : "";

                                return (
                                    <div className={styles.tablesSection}>
                                        <h4 className={styles.receiptRow}>
                                            Reserved Tables
                                        </h4>

                                        {(bookingDate || (startTime && endTime)) && (
                                            <p className={styles.timeSpan}>
                                                {bookingDate} {startTime && endTime && `(${startTime} — ${endTime})`}
                                            </p>
                                        )}

                                        <ul className={styles.tableList}>
                                            {order.tables.map((booking: any) => (
                                                <li key={booking.id} className={styles.receiptRow}>
                                                    <strong>Table №{booking.table}</strong>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })()}
                    </div>

                    <div className={styles.detailsGrid}>
                        <p><strong>City:</strong> {order.user_city}</p>
                        <p><strong>Venue city:</strong> {order.travel_calculation?.venue.city}</p>
                        <p><strong>Guests:</strong> {order.guests_count}</p>
                        <p><strong>Dates:</strong> {order.start_date} — {order.end_date}</p>
                    </div>
                    <div className={styles.divider}/>
                    {order.items && order.items.length > 0 && (
                        <div className={styles.orderSection}>
                            <h4>Menu Selection</h4>
                            {order.items.map((item) => (
                                <div key={item.id} className={styles.receiptRow}>
                                    <span>{item.menu_item_name} x{item.quantity}</span>
                                    <span>{(Number(item.menu_item_price) * rate * item.quantity).toFixed(2)} {order.currency}</span>
                                </div>
                            ))}
                            <div className={styles.subTotal}>
                                <span>Menu Total:</span>
                                <span>{(Number(order.menu_total) * rate).toFixed(2)} {order.currency}</span>
                            </div>
                        </div>
                    )}
                    {order.extra_services && order.extra_services.length > 0 && (
                        <div className={styles.orderSection}>
                            <h4>Extra Services & Bookings</h4>
                            {order.extra_services.map((extra) => {
                                const unitPrice = Number(extra.price) * rate;
                                const qty = Number(extra.quantity);
                                const guests = order.guests_count || 1;

                                let rowTotal = unitPrice * qty;
                                let calculationText = `(${qty} x ${unitPrice.toFixed(2)} ${order.currency})`;

                                if (extra.service_type === 'hotel') {
                                    rowTotal = unitPrice * qty * guests;
                                    calculationText = `(${qty} nights x ${guests} guests x ${unitPrice.toFixed(2)} ${order.currency})`;
                                } else if (extra.service_type === 'insurance') {
                                    rowTotal = unitPrice * guests;
                                    calculationText = `(${guests} guests x ${unitPrice.toFixed(2)} ${order.currency})`;
                                }

                                return (
                                    <div key={extra.id} className={styles.receiptRow}>
                                        <div className={styles.serviceInfo}>
                                            <span className={styles.serviceName}>{extra.service_name}</span>
                                            <small className={styles.mathText}>{calculationText}</small>
                                        </div>
                                        <span className={styles.rowPrice}>{rowTotal.toFixed(2)} {order.currency}</span>
                                    </div>
                                );
                            })}
                            <div className={styles.subTotal}>
                                <span>Services Total:</span>
                                <span>{(Number(order.services_total) * rate).toFixed(2)} {order.currency}</span>
                            </div>
                        </div>
                    )}
                    <div className={styles.orderSection}>
                        <h4>Travel & Logistics</h4>
                        {Number(order.flight_price) > 0 && (
                            <div className={styles.receiptRow}>
                                <span>Flight Tickets</span>
                                <span>{(Number(order.flight_price) * rate).toFixed(2)} {order.currency}</span>
                            </div>
                        )}
                        {Number(order.transfer_price) > 0 && (
                            <div className={styles.receiptRow}>
                                <span>Local Transfer</span>
                                <span>{(Number(order.transfer_price) * rate).toFixed(2)} {order.currency}</span>
                            </div>
                        )}
                    </div>
                    <div className={styles.totalBlock}>
                        <div className={styles.totalRow}>
                            <span>TOTAL PAID</span>
                            <span className={styles.totalAmount}>
                                {Number(order.total_price).toLocaleString(undefined, { minimumFractionDigits: 2 })} {order.currency}
                            </span>
                        </div>
                    </div>
                </div>

                <button onClick={onReset} className={styles.homeBtn}>Go to My Orders</button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Step 7:</h2>
             <div className={styles.wrapperTitle}>
                <h4 className={styles.bigText}> Secure Your</h4>
                <p className={styles.smallText}>booking</p>

            </div>
            <p className={styles.small}> 💳</p>
            <div className={styles.finalSummary}>
                <p className={styles.label}>Total to Pay:</p>
                <h1 className={styles.amount}>
                    {Number(order.total_price).toLocaleString(undefined, { minimumFractionDigits: 2 })} {order.currency}
                </h1>
                <button
                    className={styles.payBtn}
                    onClick={handleFinalConfirm}
                    disabled={loading}
                >
                    {loading ? "Processing..." : `Pay Now ${order.currency}`}
                </button>
            </div>
        </div>
    );
};

export default BoozerStep7Final;



