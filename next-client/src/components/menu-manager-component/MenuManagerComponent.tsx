"use client";

import React, { useRef, useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserProvider";
import { useRouter } from "next/navigation";
import venueServices from "@/lib/services/venueService";
import { IMenu } from "@/models/IVenue";
import MenuCreateComponent from "@/components/menu-create-component/MenuCreateComponent";
import styles from "./MenuManagerComponent.module.css";

interface Props {
    venue: { id: string; name?: string };
    menus: IMenu[];
}

const MenuManagerComponent: React.FC<Props> = ({venue}) => {
    const [menuList, setMenuList] = useState<IMenu[]>([]);
    const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState<string>("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const {user} = useUser();

    useEffect(() => {
        if (!user?.token) {
            return
        }
    }, [user]);

    useEffect(() => {
        const fetchFullMenu = async () => {
            if (user?.token && venue.id) {
                try {
                    setIsLoading(true);
                    const service = venueServices.venues.menu({accessToken: user.token});
                    const response = await service(venue.id).getAll();

                    setMenuList(response.data.data);
                } catch (error) {
                    console.error("Failed to fetch full menu with token", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        void fetchFullMenu();
    }, [user?.token, venue.id]);

    if (!user?.token) {
        return <p>{message}</p>;
    }
    const menuService = venueServices.venues.menu({accessToken: user.token});
    const handleDelete = async (menuId: string) => {
        if (!confirm("Are you sure you want to delete this menu?")) return;
        try {
            await menuService(venue.id).delete(menuId);
            setMenuList(menuList.filter((menu) => menu.id !== menuId));
        } catch (error) {
            setMessage("Failed to delete menu. Please try again.");
        }
    };

    const handleSave = async (menuId: string) => {
        if (!editingTitle.trim()) return;
        try {
            await menuService(venue.id).update(menuId, {title: editingTitle});
            setMenuList(
                menuList.map((menu) =>
                    menu.id === menuId ? {...menu, title: editingTitle} : menu
                )
            );
            setEditingMenuId(null);
        } catch (error) {
            setMessage("Failed to update menu. Please try again.");
        }
    };

    const handleGoToItems = (menuId: string) => {
        router.push(`/venue-admin/venues/${venue.id}/menu/${menuId}`);
    };

    const togglePublishStatus = async (menuId: string) => {
        const menu = menuList.find(m => m.id === menuId);
        if (!menu) return;

        try {
            const newStatus = !menu.is_published;
            const {data} = await menuService(venue.id).update(menuId, {is_published: newStatus});

            setMenuList(prev => prev.map(m => ({
                ...m,
                is_published: m.id === menuId ? data.is_published : (newStatus ? false : m.is_published)
            })));
        } catch {
            setMessage("Failed to update publish status.");
        }
    };

    return (
        <div className={styles.createWrapper}>
            <h3 className={styles.subtitle}>
                Menu of Venue N {venue?.id ?? "N/A"} (venue-admin {user?.profile?.name ?? "Unknown"}{" "}
                {user?.profile?.surname ?? "Unknown"})
            </h3>
            <div className={styles.wrapper}>
                {message && <p className={styles.error}>{message}</p>}
                {isLoading ? (
                    <p>Loading menus from server...</p>
                ) : menuList.length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th className={styles.tableRowTitle}>ID</th>
                            <th className={styles.tableRowTitle}>Title</th>
                            <th className={styles.tableRowTitle}>Published</th>
                            <th className={styles.tableRowTitle}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {menuList.map((menu) => (
                            <tr key={menu.id} className={styles.tableRow}>
                                <td className={styles.tableRowTitle}>{menu.id}</td>
                                <td className={styles.tableRowTitle}>
                                    {editingMenuId === menu.id ? (
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={editingTitle}
                                            onChange={(e) => setEditingTitle(e.target.value)}
                                            className={styles.editInput}
                                            onBlur={(e) => {
                                                if (e.relatedTarget?.classList.contains(styles.button)) return;
                                                setEditingMenuId(null);
                                            }}
                                        />
                                    ) : (
                                        menu.title
                                    )}
                                </td>
                                <td className={styles.tableRowTitle}>
                                    {menu.is_published ? "Published" : "Unpublished"}
                                </td>
                                <td className={styles.actions}>
                                    <button
                                        className={styles.button}
                                        onClick={(e) => {
                                            if (!menu.id) return;
                                            e.stopPropagation();
                                            void togglePublishStatus(menu.id);
                                        }}
                                    >
                                        {menu.is_published ? "Unpublish" : "Publish"}
                                    </button>
                                    {editingMenuId === menu.id ? (
                                        <>
                                            <button
                                                className={styles.button}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (menu.id) {
                                                        void handleSave(menu.id);
                                                    }
                                                }}
                                            >
                                                Save
                                            </button>
                                            <button
                                                className={styles.deleteButton}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingMenuId(null);
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className={styles.editButton}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (menu.id) {
                                                        setEditingMenuId(menu.id);
                                                    }
                                                    setEditingTitle(menu.title);
                                                }}
                                            >
                                                Edit title
                                            </button>
                                            <button
                                                className={styles.deleteButton}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (menu.id) {
                                                        void handleDelete(menu.id);
                                                    }
                                                }}
                                            >
                                                Delete
                                            </button>
                                            <button
                                                className={styles.button}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (menu.id) {
                                                        handleGoToItems(menu.id);
                                                    }
                                                }}
                                            >
                                                Go to items
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No Menus of this Venue.</p>
                )}

            </div>

            <MenuCreateComponent
                venueId={venue.id}
                onMenuCreated={(newMenu) => {
                    setMenuList([...menuList, newMenu]);
                }}
            />
        </div>
    );
};

export default MenuManagerComponent;
