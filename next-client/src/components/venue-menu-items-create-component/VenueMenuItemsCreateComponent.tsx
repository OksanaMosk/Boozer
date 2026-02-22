"use client"

import React, {useState, useEffect, ChangeEvent, SyntheticEvent} from "react";
import styles from "./VenueMenuItemsCreateComponent.module.css";
import {DndContext, closestCenter, DragEndEvent} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import SortableMenuItem from "@/components/sortable-item-component/SortableItemComponent";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";

interface MenuItem {
    id: string | number;
    name: string;
    description?: string;
    price: string | number;
    currency: string;
    position: number;
    photo?: File | null;
    preview?: string | null;
}

interface NewMenuItem {
    name: string;
    description: string;
    price: string;
    currency: string;
    photo: File | null;
    preview: string | null;
}

interface VenueMenuItemsCreateComponentProps {
    menuId: string | number;
}

const VenueMenuItemsCreateComponent: React.FC<VenueMenuItemsCreateComponentProps> = ({ menuId }) => {
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

    useEffect(() => {
        if (!menuId) return;

        fetch(`/menu-items/${menuId}`)
            .then(res => res.json())
            .then((data: MenuItem[]) => setItems(data));
    }, [menuId]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setMenuItem({ ...menuItem, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) setMenuItem({ ...menuItem, photo: file, preview: URL.createObjectURL(file) });
    };

    const handleAddItem = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!menuId) return;
        setLoadingItem(true);

        const formData = new FormData();
        formData.append("menu", menuId.toString());
        formData.append("name", menuItem.name);
        formData.append("description", menuItem.description);
        formData.append("price", menuItem.price);
        formData.append("currency", menuItem.currency);
        if (menuItem.photo) formData.append("photo_menu_item", menuItem.photo);
        formData.append("position", items.length.toString());

        try {
            const res = await fetch("/api/menu-items/", { method: "POST", body: formData });
            const data: MenuItem = await res.json();
            setItems([...items, { ...data, preview: menuItem.preview }]);
            setMenuItem({ name: "", description: "", price: "", currency: "UAH", photo: null, preview: null });
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingItem(false);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        const updated = newItems.map((item, index) => ({ ...item, position: index }));

        setItems(updated);

        await fetch("/api/menu-items/reorder/", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated.map(i => ({ id: i.id, position: i.position }))),
        });
    };

    return (
        <>
            <form className={styles.photoWrapper} onSubmit={handleAddItem}>
                <h4 className={styles.subtitle}>Add Menu Item</h4>
                <div className={styles.inputWrapper}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Item Name"
                        value={menuItem.name}
                        onChange={handleChange}
                        className={styles.inputCreate}
                        required
                    />
                </div>
                <div className={styles.inputWrapper}>
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={menuItem.description}
                        onChange={handleChange}
                        className={styles.textarea}
                    />
                </div>
                <div className={styles.inputWrapper}>
                    <input
                        type="number"
                        step="0.01"
                        name="price"
                        placeholder="Price"
                        value={menuItem.price}
                        onChange={handleChange}
                        className={styles.inputCreate}
                        required
                    />
                </div>
                <div className={styles.inputWrapper}>
                    <input
                        type="text"
                        name="currency"
                        value={menuItem.currency}
                        onChange={handleChange}
                        className={styles.inputCreate}
                    />
                </div>
                <div className={styles.inputWrapper}>
                    <input type="file" onChange={handlePhotoChange} className={styles.inputFile} />
                </div>

                <button type="submit" disabled={loadingItem} className={styles.submitButton}>
                    {loadingItem ? <div className={`authButton ${styles.loaderWrapper}`}><LoaderComponent /></div> : "Add Menu Item"}
                </button>
            </form>

            {items.length > 0 && (
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                        {items.map(item => <SortableMenuItem key={item.id} item={item} />)}
                    </SortableContext>
                </DndContext>
            )}
        </>
    );
};

export default VenueMenuItemsCreateComponent;