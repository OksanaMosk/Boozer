"use client";

import React, { useState } from "react";
import styles from "./BoozerStep7FinalComponent.module.css";
import { useUser } from "@/app/contexts/UserProvider";
import {OrderStatus} from "@/models/IVenue";
import venueServices from "@/lib/services/venueService";

interface Props {
    orderId: number;
    onReset: () => void;
    venueId: string;
}

const BoozerStep7Final: React.FC<Props> = ({ orderId, venueId, onReset }) => {
    const { user } = useUser();
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFinalConfirm = async () => {
        setLoading(true);
        const payload = {
          status: "CONFIRMED" as  OrderStatus
      };
      console.log("PAYLOAD:", payload);

      try {
          if (!user?.token) return
          await venueServices.venues
              .orders({accessToken: user.token})(venueId.toString())
              .update(orderId, (payload))

          setIsConfirmed(true);

        } catch (err) {
            console.error("Confirmation failed", err);
            alert("Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (isConfirmed) {
        return (
            <div className={styles.successContainer}>
                <div className={styles.confetti}>🎊🍹🎊</div>
                <h1>Cheers! Your " VIP Boozer" is Ready!</h1>
                <p>Order <b>#{orderId}</b> is officially confirmed.</p>
                <div className={styles.ticketBox}>
                    <p>Check your email for the invitation and route details. 📧</p>
                    <p>See you at the venue!</p>
                </div>
                <button onClick={onReset} className={styles.homeBtn}>Go to My Orders</button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2>Final Step: Secure Your Booking 💳</h2>
            <p>Once you click "Confirm & Pay", your table and travel route will be officially booked.</p>

            <div className={styles.paymentSim}>
                <p>Simulating Payment Gateway...</p>
                <div className={styles.cardIcon}>💳 Visa / MasterCard</div>
            </div>

            <div className={styles.actions}>
                <button
                    className={styles.payBtn}
                    onClick={handleFinalConfirm}
                    disabled={loading}
                >
                    {loading ? "Processing..." : "CONFIRM & PAY 🍹"}
                </button>
            </div>
        </div>
    );
};

export default BoozerStep7Final;

