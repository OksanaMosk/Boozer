"use client";

import React, {useEffect, useState} from "react";
import {AxiosResponse} from "axios";
import {useUser} from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import {ButtonScrollBottomComponent} from "@/components/button-scroll-bottom-component/ButtonScrollBottomComponent";
import styles from "./MenuVisitorComponent.module.css"

interface IMenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    photo_menu_item?: string;
    category: string;
}

interface Props {
    venueId: string;
}

const MenuVisitorComponent = ({venueId}: Props) => {
    const [menuList, setMenuList] = useState<string[]>([]);
    const [groupedItems, setGroupedItems] = useState<Record<string, IMenuItem[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const {user} = useUser()

    useEffect(() => {
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

            if (!user?.token) return;

            try {
                const response: AxiosResponse = await venueServices
                    .venues
                    .menu({accessToken: user?.token})(String(venueId))
                    .getAll();
                const menus = response.data?.data ?? [];

                const publishedMenus = menus.filter((menu: any) => menu.is_published);

                const allItems = publishedMenus.flatMap((menu: any) => menu.items || []);
                console.log("VISITOR:", response.data);
                const grouped = allItems.reduce(
                    (acc: Record<string, IMenuItem[]>, item: IMenuItem) => {
                        const category = item.category || "other";
                        if (!acc[category]) acc[category] = [];
                        acc[category].push(item);
                        return acc;
                    },
                    {}
                );

                const CATEGORY_ORDER = ["mains", "salads", "soups", "drinks", "desserts"];
                const orderedCategories = CATEGORY_ORDER.filter(cat => grouped[cat])
                    .concat(Object.keys(grouped).filter(cat => !CATEGORY_ORDER.includes(cat)));
                setGroupedItems(grouped);
                setMenuList(orderedCategories);
            } catch (err) {
                setError("Failed to load menu");
            } finally {
                setLoading(false);
            }
        };

        void fetchMenu();
    }, [venueId, user?.token]);

    if (error) return <p className={styles.error}>{error}</p>;
 if (!user?.token) {
        return <div className={styles.titleLog}>Please login</div>;
    }
    return (
        <div>
            <p className={styles.error}>{message}</p>
            <ButtonScrollBottomComponent/>
            <div className={styles.wrapperTitle}>
                <h4 className={styles.bigText}>Menu</h4>
                <div className={styles.smallText}>list</div>
            </div>
            <div className={styles.group}>
                {menuList.length === 0 ? (
                    <p className={styles.emptyState}>
                        Unfortunately, the menu is not available for viewing.
                    </p>
                ) : (
                    menuList.map((category) => (
                        <div className={styles.categoryWrapper} key={category} id={`category-${category}`}>
                            <h5 className={styles.subTitle}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </h5>
                            <div className={styles.categoryGroup}>
                                {(groupedItems[category] || []).map((item) => (
                                    <div key={item.id} className={styles.item}>
                                        <div className={styles.plate}>
                                            <img
                                                src={item.photo_menu_item || "/images/noPosterMenu.webp"}
                                                alt={item.name}
                                                className={styles.photoImage}
                                            />
                                        </div>

                                        <div className={styles.itemDetail}>
                                            <strong className={styles.title}>{item.name}</strong>
                                            <p className={styles.about}>{item.description}</p>
                                            <p className={styles.price}>
                                                {item.price} - {item.currency}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )))}</div>
        </div>
    );
};

export default MenuVisitorComponent;