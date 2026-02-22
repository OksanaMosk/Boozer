import {
    DndContext,
    closestCenter,
    DragEndEvent,
} from "@dnd-kit/core";

import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";

import React, { useEffect, useState } from "react";

import styles from "./VenueMenuCreateComponent.module.scss";
import SortableItemComponent from "@/components/sortable-item-component/SortableItemComponent";

interface MenuItem {
    id: string;
    name: string;
    price: string | number;
    currency: string;
    position: number;
    preview?: string;
}

interface MenuItemsDnDProps {
    menuId: string;
}

const MenuItemsDnD: React.FC<MenuItemsDnDProps> = ({ menuId }) => {
    const [items, setItems] = useState<MenuItem[]>([]);

    useEffect(() => {
        fetch(`/menu-items/${menuId}`)
            .then(res => res.json())
            .then((data: MenuItem[]) => setItems(data));
    }, [menuId]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        const updated = newItems.map((item, index) => ({
            ...item,
            position: index,
        }));

        setItems(updated);

        // Send new order to backend
        await fetch("/menu-items/reorder/", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
                updated.map(i => ({
                    id: i.id,
                    position: i.position,
                }))
            ),
        });
    };

    return (
        <div className={styles.formWrapper}>
            <h4 className={styles.subtitle}>Reorder Menu Items</h4>

            <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {items.map(item => (
                        <SortableItemComponent key={item.id} item={item} />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default MenuItemsDnD;