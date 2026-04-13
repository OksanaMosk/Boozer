"use client";

import React, {useState, useEffect} from "react";
import {AxiosResponse} from "axios";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
    DragEndEvent
} from "@dnd-kit/core";
import {arrayMove} from "@dnd-kit/sortable";
import {SortableContext, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {useUser} from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import DroppableCategory from "../droppable-category/DroppableCategory";
import MenuItemFormComponent from "@/components/menu-item-form-component/MenuItemFormComponent";
import {ButtonScrollBottomComponent} from "@/components/button-scroll-bottom-component/ButtonScrollBottomComponent";
import SortableMenuItem from "@/components/sortable-item-component/SortableItemComponent";
import styles from "./MenuItemsCreateComponent.module.css";

const CATEGORY_OPTIONS = ["mains", "desserts", "drinks", "salads", "soups"];

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

const MenuItemsCreateComponent: React.FC<VenueMenuItemsCreateComponentProps> = ({venueId, menuId}) => {
    const {user} = useUser();
    const [items, setItems] = useState<MenuItem[]>([]);
    const [globalCurrency, setGlobalCurrency] = useState("");
    const [activeId, setActiveId] = useState<string | number | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {distance: 8}}));
    const activeItem = items.find(i => i.id === activeId);

    const getMenuItemsService = () => {
        if (!user?.token || !menuId) return null;
        return venueServices.venues.menuItems({accessToken: user.token})(venueId)(menuId.toString());
    };

    useEffect(() => {
        const fetchVenueCurrency = async () => {
            if (!user?.token) return;
            try {
                const res = await venueServices.venues.get(venueId, ({accessToken: user.token}));
                setGlobalCurrency(res.data.currency);
            } catch (err) {
                 setFetchError("Could not load venue currency. Default may be used.");
            }
        };
        void fetchVenueCurrency();
    }, [venueId, user?.token]);

    useEffect(() => {
        const fetchMenuItems = async () => {
            const service = getMenuItemsService();
            if (!service) return;
            setFetchError(null);
            try {
                const result: AxiosResponse = await service.getAll();
                const fetchedItems = result.data;
                setItems(fetchedItems);
            } catch (err: any) {
                const errorMsg = err?.response?.data?.detail || "Failed to load menu items";
                setFetchError(errorMsg);
            }
        };
        void fetchMenuItems();
    }, [menuId, venueId, user?.token]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const {active, over} = event;
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
                newItems[idx] = {...item, position: index};
            });
        } else {

            newItems = newItems.map(item =>
                item.id === activeItem.id
                    ? {...item, category: newCategory, position: 0}
                    : item
            );

            CATEGORY_OPTIONS.forEach(category => {
                newItems
                    .filter(i => i.category === category)
                    .sort((a, b) => a.position - b.position)
                    .forEach((item, index) => {
                        const idx = newItems.findIndex(i => i.id === item.id);
                        newItems[idx] = {...item, position: index};
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
                        .sort((a, b) => a.position - b.position);
                    const newPosition = categoryItems.findIndex(i => i.id === item.id);
                    return {...item, position: newPosition};
                });
            });

        } catch (err) {
           setFetchError("Delete failed. Please try again.");
        }
    };
    const handleCreateOrUpdate = React.useCallback((item: MenuItem) => {
        setItems(prev => {
            const exists = prev.find(i => i.id === item.id);
            if (exists) {
                return prev.map(i => (i.id === item.id ? item : i));
            }
            return [...prev, {...item, currency: globalCurrency}];
        });
    }, [globalCurrency]);

    return (
        <div className={styles.itemsWrapper}>
            <ButtonScrollBottomComponent/>
            <div className={styles.wrapperTitle}>
                <h4 className={styles.bigText}>
                    Menu
                </h4>
                <div className={styles.smallText}>
                    list
                </div>
            </div>
            <div className={styles.selectCurrency}>
                {fetchError && <p className={styles.currencyDisplay}>{fetchError}</p>}
                <div className={styles.currencyDisplay}>
                    <label>Currency: {}</label>
                    <span className={styles.currency}>
                            {globalCurrency ? globalCurrency : "Loading..."}
                        </span>
                </div>
                <p className={styles.currencyValue}>
                    🔒 This currency is set in Venue Settings and applies to all menus.
                </p>
            </div>

            <DndContext collisionDetection={closestCorners} sensors={sensors}
                        onDragStart={e => setActiveId(e.active.id)} onDragEnd={handleDragEnd}>
                {CATEGORY_OPTIONS.map(category => (
                    <DroppableCategory key={category} id={`category-${category}`}>
                        <h5 className={styles.subTitle}>{category.charAt(0).toUpperCase() + category.slice(1)}</h5>
                        <div className={styles.categoryGroup}>

                            <SortableContext items={(groupedItems[category] || []).map(i => i.id)}
                                             strategy={verticalListSortingStrategy}>
                                {groupedItems[category]?.map(item => (
                                    <SortableMenuItem key={item.id} item={item} onDelete={() => handleDelete(item.id)}/>
                                ))}
                            </SortableContext>
                        </div>
                    </DroppableCategory>
                ))}
                <DragOverlay>{activeItem && <SortableMenuItem item={activeItem} onDelete={() => {
                }} isOverlay/>}</DragOverlay>
            </DndContext>

            <h4 className={styles.titleForm}>Add Menu Item</h4>
            <MenuItemFormComponent
                venueId={venueId}
                menuId={menuId}
                globalCurrency={globalCurrency}
                onCreate={handleCreateOrUpdate}
            />
        </div>
    );
};

export default MenuItemsCreateComponent;
