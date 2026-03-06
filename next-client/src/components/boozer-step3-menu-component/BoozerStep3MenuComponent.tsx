"use client";

import React, { useState, useEffect } from "react";
import styles from "./BoozerStep3MenuComponent.module.css";
import venueServices from "@/lib/services/venueService";
import { useUser } from "@/app/contexts/UserProvider";
import axios from "axios";

interface IMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  photo?: string;
  category: string;
}

interface Props {
  venueId: string;
  orderId: number;
  onNext: () => void;
  onBack: () => void;
}

const BoozerStep3MenuComponent: React.FC<Props> = ({ venueId, orderId, onNext, onBack }) => {
  const { user } = useUser();
  const [menuList, setMenuList] = useState<string[]>([]);
  const [groupedItems, setGroupedItems] = useState<Record<string, IMenuItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [cart, setCart] = useState<Record<string, number>>({});

  const addPortion = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removePortion = (id: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (copy[id] > 1) copy[id] -= 1;
      else delete copy[id];
      return copy;
    });
  };

  const getItemTotal = (item: IMenuItem) => (cart[item.id] || 0) * item.price;

  const total = Object.keys(cart).reduce((sum, id) => {
    const categoryItems = Object.values(groupedItems).flat();
    const item = categoryItems.find((i) => i.id === id);
    return item ? sum + getItemTotal(item) : sum;
  }, 0);

  useEffect(() => {
    const fetchMenu = async () => {
      if (!venueId || !user?.token) return;
      setLoading(true);
      try {
        const response = await venueServices.venues.menu({ accessToken: user.token })(String(venueId)).getAll();
        const menus = response.data?.data ?? response.data ?? [];
        const allItems = menus.flatMap((menu: any) => menu.items || []);
        const grouped = allItems.reduce((acc: Record<string, IMenuItem[]>, item: IMenuItem) => {
          const category = item.category || "other";
          if (!acc[category]) acc[category] = [];
          acc[category].push(item);
          return acc;
        }, {});
        setGroupedItems(grouped);
        setMenuList(Object.keys(grouped));
      } catch (err) {
        setMessage("Failed to load menu");
      } finally {
        setLoading(false);
      }
    };
    void fetchMenu();
  }, [venueId, user?.token]);
  const handleNextStep = async () => {
    setIsSubmitting(true);
    const items = Object.entries(cart).map(([id, qty]) => ({
      menu_item: parseInt(id),
      quantity: qty
    }));

    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/`, {
        items,
        status: "HOLD"
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });

      onNext();
    } catch (err) {
      console.error("Update order error:", err);
      setMessage("Error updating order items");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p className={styles.loading}>Loading tasty menu... 🍔</p>;

  return (
    <div className={styles.orderPage}>
      <div className={styles.wrapperTitle}>
        <h4 className={styles.bigText}>Step 3: Menu Selection</h4>
        <div className={styles.smallText}>Order #{orderId} - Selection</div>
      </div>

      {menuList.map((category) => (
        <div key={category} className={styles.categorySection}>
          <h5 className={styles.subTitle}>{category.toUpperCase()}</h5>
          <div className={styles.categoryGroup}>
            {(groupedItems[category] || []).map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.plate}>
                  <img src={item.photo || "/images/noPosterMenu.webp"} alt={item.name} className={styles.photoImage} />
                </div>
                <div className={styles.itemDetail}>
                  <strong className={styles.title}>{item.name}</strong>
                  <p className={styles.price}>{item.price} {item.currency}</p>

                  <div className={styles.itemControls}>
                    <button onClick={() => removePortion(item.id)} className={styles.qtyBtn}>-</button>
                    <span className={styles.quantity}>{cart[item.id] || 0}</span>
                    <button onClick={() => addPortion(item.id)} className={styles.qtyBtn}>+</button>
                    <span className={styles.itemTotal}>{getItemTotal(item)} {item.currency}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className={styles.orderSummary}>
        <div className={styles.totalValue}>
            <span>Grand Total:</span>
            <strong>{total} UAH</strong>
        </div>

        <div className={styles.wizardButtons}>
            <button onClick={onBack} className={styles.backBtn} disabled={isSubmitting}>Back</button>
            <button
                onClick={handleNextStep}
                className={styles.checkoutBtn}
                disabled={isSubmitting}
            >
                {isSubmitting ? "Saving..." : "Next: Extra Services ➔"}
            </button>
        </div>
      </div>
      {message && <p className={styles.errorMessage}>{message}</p>}
    </div>
  );
};

export default BoozerStep3MenuComponent;
