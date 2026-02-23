"use client";

import React, {useState, useEffect, ChangeEvent, SyntheticEvent} from "react";
import styles from "./VenueMenuItemsCreateComponent.module.css";
import {DndContext, closestCenter, DragEndEvent} from "@dnd-kit/core";
import {SortableContext, verticalListSortingStrategy, arrayMove} from "@dnd-kit/sortable";
import SortableMenuItem from "@/components/sortable-item-component/SortableItemComponent";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import venueServices from "@/lib/services/venueService";
import {useUser} from "@/app/contexts/UserProvider";
import {AxiosResponse} from "axios";
import {SinglePhotoComponent} from "@/components/single-photo-component/SinglePhotoComponent";

interface MenuItem {
    id: string;
    name: string;
    description?: string;
    price: number | string;
    currency: string;
    position: number;
    photo?: File | null;
    preview?: string | null;
}

interface NewMenuItem {
    name: string;
    description: string;
    price: number | string;
    currency: string;
    photo: File | null;
    preview: string | null;
}

interface VenueMenuItemsCreateComponentProps {
    venueId: string;
    menuId: string | number;
}

const VenueMenuItemsCreateComponent: React.FC<VenueMenuItemsCreateComponentProps> = ({menuId, venueId}) => {
    const {user} = useUser();
    const [items, setItems] = useState<MenuItem[]>([]);
    const [menuItem, setMenuItem] = useState<NewMenuItem>({
        name: "",
        description: "",
        price: "",
        currency: "UAH",
        photo: null,
        preview: null,
    });
    const [loadingItem, setLoadingItem] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [createdItem, setCreatedItem] = useState<MenuItem | null>(null);

    const getMenuItemsService = () => {
        if (!user?.token || !menuId) return null;
        return venueServices.venues.menuItems({accessToken: user.token})(venueId)(menuId.toString());
    };

    useEffect(() => {
        const fetchMenuItems = async () => {
            const service = getMenuItemsService();
            if (!service) return;

            try {
                const result: AxiosResponse = await service.getAll();
                const resData: MenuItem[] = result.data.data;

                console.log("result:", result)
                setItems(resData);
            } catch (err: any) {
                setMessage("Failed to load menu items.");
            }
        };

        void fetchMenuItems();
    }, [menuId, venueId, user?.token]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setMenuItem({...menuItem, [e.target.name]: e.target.value});
    };

    const handleAddItem = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoadingItem(true);
        const service = getMenuItemsService();
        if (!service) return;

        try {
            const data = new FormData();
            data.append("name", menuItem.name);
            data.append("description", menuItem.description);
            data.append("price", menuItem.price.toString());
            data.append("currency", menuItem.currency);
            data.append("position", items.length.toString());
            if (menuItem.photo) data.append("photo_menu_item", menuItem.photo);

            const createdResponse: AxiosResponse = await service.create(data as any);

            const newItem: MenuItem = {
                ...createdResponse.data,
                preview: menuItem.preview,
                position: items.length
            };
            setCreatedItem(newItem);
            setItems([...items, newItem]);
            setMenuItem({name: "", description: "", price: "", currency: "UAH", photo: null, preview: null});
        } catch (err) {
            console.error(err);
            setMessage("Failed to create menu item.");
        } finally {
            setLoadingItem(false);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const {active, over} = event;
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        const updated = newItems.map((item, index) => ({...item, position: index}));
        setItems(updated);
        const body = updated.map(i => ({id: i.id, position: i.position}));
        try {
            const service = getMenuItemsService();

            const res = await service!.reorder(body);

            console.log("Reorder successful:", res.data);
        } catch (err: any) {
            console.error("Failed to reorder items", err);
            setMessage(err?.response?.data?.detail || "Failed to update item order.");
        }
    };

    const handleDelete = async (menuItemId: string | number) => {
        const service = getMenuItemsService();
        if (!service) return;

        try {
            await service.delete(menuItemId.toString());
            setItems(items.filter(i => i.id !== menuItemId));
        } catch (err) {
            console.error(err);
            setMessage("Failed to delete menu item.");
        }
    };

    return (
        <>
            <h3 className={styles.subtitle}>Menu items</h3>
            {items.length > 0 ? (
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                        {items.map(item => (
                            <SortableMenuItem key={item.id} item={item} onDelete={() => handleDelete(item.id)}/>
                        ))}
                    </SortableContext>
                </DndContext>

            ) : (<p>No menu items available</p>

            )}
            <h4 className={styles.subtitle}>Add Menu Item</h4>
            <form className={styles.wrapper} onSubmit={handleAddItem}>
                <div className={styles.form}>
                    <div className={styles.inputWrapper}>
                        <input type="text" name="name" placeholder="Item Name" value={menuItem.name}
                               onChange={handleChange} className={styles.inputCreate} required/>
                    </div>
                    <div className={styles.inputWrapper}>
                        <textarea name="description" placeholder="Description" value={menuItem.description}
                                  onChange={handleChange} className={styles.textarea}/>
                    </div>
                    <div className={styles.inputWrapper}>
                        <input type="number" step="0.01" name="price" placeholder="Price" value={menuItem.price}
                               onChange={handleChange} className={styles.inputCreate} required/>
                    </div>
                    <div className={styles.inputWrapper}>
                        <input type="text" name="currency" value={menuItem.currency} onChange={handleChange}
                               className={styles.inputCreate}/>
                    </div>

                    {createdItem && (
                        <SinglePhotoComponent
                            initialPhotoUrl={createdItem?.preview || ""}
                            label="Upload Menu Item Photo"
                            onUpload={async (file: File) => {

                                const formData = new FormData();
                                formData.append("photo_menu_item", file);
                                if (!user?.token || !createdItem) return "";

                                const res = await venueServices.venues
                                    .menuItems({accessToken: user.token})(venueId)(createdItem.id)
                                    .update(createdItem.id, formData as any);
                                return res.data.photo_menu_item;
                            }}
                            onChange={(url) => {
                                setCreatedItem(prev => prev ? {...prev, preview: url} : prev);
                                setItems(prev =>
                                    prev.map(i => (i.id === createdItem?.id ? {...i, preview: url} : i))
                                );
                            }}
                        />
                    )}

                    <button type="submit" disabled={loadingItem} className={styles.button}>
                        {loadingItem ? <div className={styles.loaderWrapper}><LoaderComponent/></div> : "Add Menu Item"}
                    </button>
                </div>
            </form>

            {message && <p className={styles.errorMessage}>{message}</p>}
        </>
    );
};

export default VenueMenuItemsCreateComponent;