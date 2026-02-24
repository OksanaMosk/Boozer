"use client";

import React, {useState, useEffect} from "react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
    DragEndEvent
} from "@dnd-kit/core";
import {SortableContext, verticalListSortingStrategy} from "@dnd-kit/sortable";
import SortableMenuItem from "@/components/sortable-item-component/SortableItemComponent";
import venueServices from "@/lib/services/venueService";
import {useUser} from "@/app/contexts/UserProvider";
import {arrayMove} from "@dnd-kit/sortable";
import styles from "./VenueMenuItemsCreateComponent.module.css";
import {AxiosResponse} from "axios";
import DroppableCategory from "../droppable-category/DroppableCategory";
import MenuItemForm from "@/components/menu-item-form/MenuItemForm";

const CATEGORY_OPTIONS = ["main", "dessert", "drink", "salad", "soup"];
const CURRENCY_OPTIONS = ["UAH", "USD", "EUR"];

interface MenuItem {
    id: string | number;
    name: string;
    description?: string;
    price: number | string;
    currency: string;
    category: string;
    position: number;
    photo?: File | null;
    preview?: string | null;

}

interface VenueMenuItemsCreateComponentProps {
    venueId: string;
    menuId: string;
}

const VenueMenuItemsCreateComponent: React.FC<VenueMenuItemsCreateComponentProps> = ({venueId, menuId}) => {
    const {user} = useUser();
    const [items, setItems] = useState<MenuItem[]>([]);
    const [globalCurrency, setGlobalCurrency] = useState("UAH");
    const [activeId, setActiveId] = useState<string | number | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {distance: 8}}));
    const activeItem = items.find(i => i.id === activeId);

    const getMenuItemsService = () => {
        if (!user?.token || !menuId) return null;
        return venueServices.venues.menuItems({accessToken: user.token})(venueId)(menuId.toString());
    };


    useEffect(() => {
        const fetchMenuItems = async () => {
            const service = getMenuItemsService();
            if (!service) return;
            try {
                const result:AxiosResponse = await service.getAll();
                setItems(result.data.data);
            } catch {}
        };
        void fetchMenuItems();
    }, [menuId, venueId, user?.token]);

       const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeItem = items.find(i => String(i.id) === String(active.id));
    const overItem = items.find(i => String(i.id) === String(over.id));

    if (!activeItem) return;

    let newCategory = activeItem.category;

    if (over && String(over.id).startsWith("category-")) {
        newCategory = String(over.id).replace("category-", "");
    } else if (overItem) {
        newCategory = overItem.category;
    }

    let newItems = [...items];

    if (activeItem.category === newCategory && overItem) {
        const categoryItems = newItems
            .filter(i => i.category === newCategory)
            .sort((a, b) => a.position - b.position);
        const oldIndex = categoryItems.findIndex(i => i.id === activeItem.id);
        const newIndex = categoryItems.findIndex(i => i.id === overItem.id);
        const movedCategoryItems = arrayMove(categoryItems, oldIndex, newIndex);
        movedCategoryItems.forEach((item, index) => {
            const idx = newItems.findIndex(i => i.id === item.id);
            newItems[idx] = { ...item, position: index };
        });
    } else {

        newItems = newItems.map(item =>
            item.id === activeItem.id
                ? { ...item, category: newCategory, position: 0 }
                : item
        );

        CATEGORY_OPTIONS.forEach(category => {
            newItems
                .filter(i => i.category === category)
                .sort((a, b) => a.position - b.position)
                .forEach((item, index) => {
                    const idx = newItems.findIndex(i => i.id === item.id);
                    newItems[idx] = { ...item, position: index };
                });
        });
    }

    setItems(newItems);

    const service = getMenuItemsService();
    if (service) {
        const body = newItems.map(i => ({
            id: String(i.id),
            position: i.position,
            category: i.category,
        }));

        service.reorder(body).catch(() =>
            postMessage("Failed to update item order.")
        );
    }
};

    const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, MenuItem[]>);

    for (const category in groupedItems) {
        groupedItems[category].sort((a, b) => a.position - b.position);
    }

const handleDelete = async (menuItemId: string | number) => {
    const service = getMenuItemsService();
    if (!service) return;

    try {
        await service.delete(String(menuItemId));

        setItems(prev => {
            const filtered = prev.filter(i => i.id !== menuItemId);
            return filtered.map(item => {
                const categoryItems = filtered
                    .filter(i => i.category === item.category)
                    .sort((a,b)=>a.position-b.position);
                const newPosition = categoryItems.findIndex(i => i.id === item.id);
                return {...item, position: newPosition};
            });
        });

    } catch (err) {
        console.error("Delete failed", err);
    }
};
    const handleCreateOrUpdate = React.useCallback((item: MenuItem) => {
    setItems(prev => {
        const exists = prev.find(i => i.id === item.id);
        if (exists) {
            return prev.map(i => (i.id === item.id ? item : i));
        }
        return [...prev, item];
    });
}, []);

    return (
        <div className={styles.itemsWrapper}>
             <div className={styles.wrapperTitle}>
            <h4 className={styles.bigText}>
                Menu
            </h4>
            <div className={styles.smallText}>
               list
            </div>
        </div>
            <div className={styles.selectCurrency}>
                <label>Currency:</label>
                <select value={globalCurrency} onChange={(e)=>setGlobalCurrency(e.target.value)} className={styles.select}>
                    {CURRENCY_OPTIONS.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <DndContext collisionDetection={closestCorners} sensors={sensors} onDragStart={e=>setActiveId(e.active.id)} onDragEnd={handleDragEnd}>
                {CATEGORY_OPTIONS.map(category => (
                    <DroppableCategory key={category} id={`category-${category}`} >
                        <h5 className={styles.subTitle}>{category.charAt(0).toUpperCase()+category.slice(1)}</h5>
                        <div className={styles.categoryGroup}>

                            <SortableContext items={(groupedItems[category] || []).map(i=>i.id)} strategy={verticalListSortingStrategy}>
                                {groupedItems[category]?.map(item => (
                                    <SortableMenuItem key={item.id} item={item} onDelete={()=>handleDelete(item.id)}/>
                                ))}
                            </SortableContext>
                        </div>
                    </DroppableCategory>
                ))}
                <DragOverlay>{activeItem && <SortableMenuItem item={activeItem} onDelete={()=>{}} isOverlay />}</DragOverlay>
            </DndContext>

            <h4 className={styles.titleForm}>Add Menu Item</h4>
            <MenuItemForm
                venueId={venueId}
                menuId={menuId}
                globalCurrency={globalCurrency}
                onCreate={handleCreateOrUpdate}
            />
        </div>
    );
};

export default VenueMenuItemsCreateComponent;

