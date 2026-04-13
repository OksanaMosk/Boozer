"use client";

import React, { useState, useCallback, useMemo } from "react";
import styles from "./OrderItemComponent.module.css";
import { useUser } from "@/app/contexts/UserProvider";
import { IOrder } from "@/models/IOrder";
import venueServices from "@/lib/services/venueService";

interface OrderItemProps {
    order: IOrder;
    onUpdate: () => void;
    venueId?: string;
}

export const OrderItemComponent = ({ order, onUpdate, venueId }: OrderItemProps) => {
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [statusMsg, setStatusMsg] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const permissions = useMemo(() => {
    if (!user || !order) return {};

    const userRole = user.role?.toLowerCase();
    const isAdmin = userRole === "admin";
        const isVenueAdmin = userRole === "venue_admin";
        const orderVenueId = String(order.venue?.id || order.venue);
        const hasAccess = user.managed_venue_ids?.includes(Number(orderVenueId));
        const canManage = isAdmin || (isVenueAdmin && (hasAccess || (venueId && String(venueId) === orderVenueId)));

        return {
            canManage,
            canDelete: isAdmin,
            canRefund: (String(user.id) === String(order.user?.id || order.user) ) &&
                order.status === "CONFIRMED" && !order.comment?.includes("[REFUND]"),
            isRefundPending: order.comment?.includes("[REFUND]")
        };
    }, [user, order, venueId]);

    const orderService = useMemo(() => {
        if (!user?.token) return null;
        const tokenObj = { accessToken: user.token };
        return venueId
            ? venueServices.venues.orders(tokenObj)(venueId)
            : venueServices.orders(tokenObj);
    }, [user?.token, venueId]);

    const rate = Number(order.exchange_rate || 1);

    const requestAction = useCallback(async (action: () => Promise<any>, label: string) => {
        if (!user?.token || !order.id) return;
        setIsProcessing(true);
        try {
            await action();
            setStatusMsg(label);
            setTimeout(() => { onUpdate(); setStatusMsg(null); }, 2000);
        } catch {
            setStatusMsg("Failed");
            setTimeout(() => setStatusMsg(null), 3000);
        } finally { setIsProcessing(false); }
    }, [user?.token, order.id, onUpdate]);

    const onAdminCancel = () => {
        if (!orderService) return;
        void requestAction(() => orderService.updateStatus(String(order.id), "CANCELLED"), "status: CANCELLED");
    };

    const onAdminDelete = () => {
        if (!orderService) return;
        void requestAction(() => orderService.delete(String(order.id)), "Order Deleted");
    };

    const onRefundRequest = () => {
        if (!orderService) return;
        const payload = { comment: `[REFUND] Requested on ${new Date().toISOString().split('T')[0]}. \n${order.comment || ""}` };
        void requestAction(() => orderService.update(String(order.id), payload), "Refund Initialized");
    };

    return (
        <div className={`${styles.receiptCard} ${isOpen ? styles.active : ""}`}>
            <div className={styles.cardHeader} onClick={() => setIsOpen(!isOpen)}>
                <div className={styles.headerInfo}>
                    <span className={styles.goldId}>Order #{order.id}</span>
                    <h3 className={styles.venueTitle}>{order.venue_name || "Premium Venue"}</h3>
                    <p className={styles.venueCity}>({order.travel_calculation?.venue?.city || "Location"})</p>
                </div>
                <div className={styles.headerStatus}>
                    <span className={`${styles.statusBadge} ${styles[order.status?.toLowerCase() || 'pending']}`}>
                        {order.status?.replace('_', ' ')}
                    </span>
                    <span className={styles.arrow}>▼</span>
                </div>
            </div>

            <div className={styles.receiptContent}>
                <div className={styles.detailsGrid}>
                    <p>{order.start_date ? new Date(order.start_date).toLocaleDateString('uk-UA') : "—"}
                        {order.end_date && ` — ${new Date(order.end_date).toLocaleDateString('uk-UA')}`}</p>
                    <p><strong>Guests:</strong> {order.guests_count}</p>
                    <p><strong>City:</strong> {order.user_city || "Private"}</p>
                </div>

                <div className={styles.divider}/>
                {order.items && order.items.length > 0 && (
                    <div className={styles.orderSection}>
                        <h4>Menu Selection</h4>
                        {order.items.map((item) => (
                            <div key={item.id} className={styles.receiptRow}>
                                <span>{item.menu_item_name} x {item.quantity}</span>
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
                        <div className={styles.divider}/>
                        <h4>Extra Services</h4>
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
                                        <span className={styles.serviceInfo} >{extra.service_name}</span>
                                        <br/>
                                        <small style={{fontSize: '0.8em', color: '#666'}}>{calculationText}</small>
                                    </div>
                                    <span>{rowTotal.toFixed(2)} {order.currency}</span>
                                </div>
                            );
                        })}
                        <div className={styles.subTotal} >
                            <span>Services Total:</span>
                            <span>{(Number(order.services_total) * rate).toFixed(2)} {order.currency}</span>
                        </div>
                    </div>
                )}

                {(Number(order.flight_price) > 0 || Number(order.transfer_price) > 0) && (
                    <div className={styles.orderSection}>
                         <div className={styles.divider}/>
                        <h4>Travel & Logistics</h4>
                        {Number(order.flight_price) > 0 && (
                            <div className={styles.receiptRow}>
                                <span className={styles.logistics}>Flight Tickets</span>
                                <span className={styles.logistics}>{(Number(order.flight_price) * rate).toFixed(2)} {order.currency}</span>
                            </div>
                        )}
                        {Number(order.transfer_price) > 0 && (
                            <div className={styles.receiptRow}>
                                <span className={styles.logistics}>Local Transfer</span>
                                <span className={styles.logistics}>{(Number(order.transfer_price) * rate).toFixed(2)} {order.currency}</span>
                            </div>
                        )}
                    </div>
                )}
                <div className={styles.totalBlock}>
                    <div className={styles.totalRow}>
                        <span>TOTAL PAID</span>
                        <span className={styles.totalAmount}>
                           {Number(order.total_price).toLocaleString(undefined, {minimumFractionDigits: 2})} {order.currency}
                        </span>
                    </div>
                </div>

                <div className={styles.actionBlock}>
                    {statusMsg ? (
                        <div className={styles.statusNotification}><span className={styles.pulse}/> {statusMsg}</div>
                    ) : isProcessing ? (
                        <div className={styles.processingState}>Processing...</div>
                    ) : (
                        <div className={styles.buttonLayout}>
                            {order.status !== "CANCELLED" ? (
                                permissions.canManage && (
                                    <button className={styles.secondaryBtn} onClick={onAdminCancel}>
                                        Cancel Order
                                    </button>
                                )
                            ) : (

                                <span className={styles.cancelledLabel}>Order is Cancelled</span>
                            )}
                            {permissions.canDelete && (
                                <button className={styles.dangerBtn} onClick={onAdminDelete}>
                                    Delete
                                </button>
                            )}
                            {permissions.canRefund && (
                                <button className={styles.premiumActionBtn} onClick={onRefundRequest}>Request
                                    Refund</button>
                            )}
                            {permissions.isRefundPending && (
                                <div className={styles.pendingIndicator}>Refund Review Pending</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
