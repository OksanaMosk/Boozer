"use client";

import React, { useEffect, useState } from "react";
import styles from "./MenuVisitorComponent.module.css"
import venueServices from "@/lib/services/venueService";
import {useUser} from "@/app/contexts/UserProvider";

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

const MenuVisitorComponent = ({ venueId }: Props) => {
  const [menuList, setMenuList] = useState<string[]>([]);
  const [groupedItems, setGroupedItems] = useState<Record<string, IMenuItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const {user} = useUser()

  useEffect(() => {
      console.log("Venue ID:", venueId);
  if (!venueId || isNaN(Number(venueId))) {
    setMessage("Invalid Venue ID");
    setLoading(false);
    return;
  }


const fetchMenu = async () => {
       if (!venueId) {
      setMessage("Venue ID is missing");
      setLoading(false);
      return;
    }

    if (!user?.token) {
      setMessage("Please log in.");
      setLoading(false);
      return;
    }
    try {
      const response = await venueServices
        .venues
        .menu({ accessToken: user?.token })(String(venueId))
        .getAll();

      console.log("Menu response:", response.data); // ✅ бачимо що прийшло з API

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
      console.error("Fetch menu error:", err);
      setError("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  void fetchMenu();
}, [venueId, user?.token]);

  if (loading) return <p>Loading menu...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
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
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuVisitorComponent;