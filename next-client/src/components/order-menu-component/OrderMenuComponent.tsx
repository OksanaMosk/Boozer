"use client";

import React, { useEffect, useState } from "react";
import styles from "./OrderMenuComponent.module.css";
import venueServices from "@/lib/services/venueService";
import { useUser } from "@/app/contexts/UserProvider";

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
}

const OrderMenuComponent = ({ venueId }: Props) => {
  const { user } = useUser();
  const [menuList, setMenuList] = useState<string[]>([]);
  const [groupedItems, setGroupedItems] = useState<Record<string, IMenuItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const [cart, setCart] = useState<Record<string, number>>({});

  const addPortion = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removePortion = (id: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      if ((copy[id] || 0) > 1) copy[id] -= 1;
      else delete copy[id];
      return copy;
    });
  };

  const getItemTotal = (item: IMenuItem) => (cart[item.id] || 0) * item.price;

  const total = Object.keys(cart).reduce((sum, id) => {
    const categoryItems = Object.values(groupedItems).flat();
    const item = categoryItems.find((i) => i.id === id);
    if (!item) return sum;
    return sum + getItemTotal(item);
  }, 0);

  useEffect(() => {
    if (!venueId || isNaN(Number(venueId))) {
      setMessage("Invalid Venue ID");
      setLoading(false);
      return;
    }



    const fetchMenu = async () => {
      setLoading(true);
      try {
          if (!user?.token) {
      setMessage("Please log in.");
      setLoading(false);
      return;
    }
        const response = await venueServices
          .venues
          .menu({ accessToken: user.token })(String(venueId))
          .getAll();

        const menus = response.data?.data ?? response.data ?? [];
        const allItems = menus.flatMap((menu: any) => menu.items || []);
        const grouped = allItems.reduce(
          (acc: Record<string, IMenuItem[]>, item: IMenuItem) => {
            const category = item.category || "other";
            if (!acc[category]) acc[category] = [];
            acc[category].push(item);
            return acc;
          },
          {}
        );

        setGroupedItems(grouped);
        setMenuList(Object.keys(grouped));
      } catch (err) {
        console.error(err);
        setError("Failed to load menu");
      } finally {
        setLoading(false);
      }
    };

    void fetchMenu();
  }, [venueId, user?.token]);

  if (error) return <p>{error}</p>;

  return (
    <div className={styles.orderPage}>
      <p>{message}</p>
      <div className={styles.wrapperTitle}>
        <h4 className={styles.bigText}>Menu</h4>
        <div className={styles.smallText}>list</div>
      </div>

      {menuList.map((category) => (
        <div key={category} id={`category-${category}`}>
          <h5 className={styles.subTitle}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </h5>

          <div className={styles.categoryGroup}>
            {(groupedItems[category] || []).map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.plate}>
                  <img
                    src={item.photo || "/images/noPosterMenu.webp"}
                    alt={item.name}
                    className={styles.photoImage}
                  />
                </div>

                <div className={styles.itemDetail}>
                  <strong className={styles.title}>{item.name}</strong>
                  <p className={styles.about}>{item.description}</p>
                  <p className={styles.price}>
                    {item.price} {item.currency}
                  </p>

                  <div className={styles.itemControls}>
                    <button onClick={() => removePortion(item.id)}>-</button>
                    <span className={styles.quantity}>{cart[item.id] || 0}</span>
                    <button onClick={() => addPortion(item.id)}>+</button>
                    <span className={styles.itemTotal}>
                      {getItemTotal(item)} {item.currency}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className={styles.orderSummary}>
        <strong>Сумарно: {total} грн</strong>
        <button className={styles.checkoutBtn}>Оформити замовлення</button>
      </div>
    </div>
  );
};

export default OrderMenuComponent;