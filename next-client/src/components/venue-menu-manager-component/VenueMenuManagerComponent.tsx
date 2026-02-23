"use client";

import React, { useRef, useState, useEffect } from "react";
import VenueMenuCreateComponent from "@/components/venue-menu-create-component/VenueMenuCreateComponent";
import { IMenu } from "@/models/IVenue";
import styles from "./VenueMenuManagerComponent.module.css";
import venueServices from "@/lib/services/venueService";
import { useUser } from "@/app/contexts/UserProvider";
import { useRouter } from "next/navigation";

interface Props {
  venue: { id: string; name?: string };
  menus: IMenu[];
}

const VenueMenuManagerComponent: React.FC<Props> = ({ venue, menus }) => {
  const [menuList, setMenuList] = useState<IMenu[]>(menus);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (!user?.token) {
      setMessage("User not authenticated.");
    }
  }, [user]);

  if (!user?.token) {
    return <p>{message}</p>;
  }

  const menuService = venueServices.venues.menu({ accessToken: user.token });

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
      await menuService(venue.id).update(menuId, { title: editingTitle });
      setMenuList(
        menuList.map((menu) =>
          menu.id === menuId ? { ...menu, title: editingTitle } : menu
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

  return (
    <div className={styles.createWrapper}>
      <h3 className={styles.subtitle}>
        Menu of Venue N {venue?.id ?? "N/A"} (venue-admin {user?.profile?.name ?? "Unknown"}{" "}
        {user?.profile?.surname ?? "Unknown"})
      </h3>
      <div className={styles.wrapper}>
        {message && <p className={styles.error}>{message}</p>}
        {menuList.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableRowTitle}>ID</th>
                <th className={styles.tableRowTitle}>Title</th>
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

                  <td className={styles.actions}>
                    {editingMenuId === menu.id ? (
                      <>
                        <button
                          className={styles.button}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (menu.id) {
                              void  handleSave(menu.id);
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
                            setEditingMenuId(menu.id);}
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

        <VenueMenuCreateComponent
            venueId={venue.id}
            onMenuCreated={(newMenu) => {
                setMenuList([...menuList, newMenu]);
            }}
        />
    </div>
  );
};

export default VenueMenuManagerComponent;
