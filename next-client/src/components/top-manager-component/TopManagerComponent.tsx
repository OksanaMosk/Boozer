"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
    DragEndEvent,
    DragStartEvent
} from "@dnd-kit/core";

import {
    SortableContext,
    arrayMove,
    horizontalListSortingStrategy
} from "@dnd-kit/sortable";
import { useUser } from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import styles from "./TopManagerComponent.module.css";
import { useSearchParams } from "next/navigation";

import DroppableCategory from "../droppable-category/DroppableCategory";
import TopCreateComponent from "@/components/top-create-component/TopCreateComponent";
import SortableVenueItemComponent from "@/components/sortable-venueI-item-component/SortableVenueItemComponent";
import {AxiosResponse} from "axios";

const TopManagerComponent = () => {
    const { user } = useUser();
    const searchParams = useSearchParams();
    const sourceCategory = searchParams.get("category");

    const [collections, setCollections] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [activeId, setActiveId] = useState<string | number | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const loadData = async () => {
        if (!user?.token || !user?.id) return;
        const auth = { accessToken: user.token };
        try {
            const resCols = await venueServices.collections(auth).getAll();
            const cols = resCols.data?.data || resCols.data || [];
            setCollections(cols);

            let allItems: any[] = [];
            if (sourceCategory) {
                const resCan = await venueServices.favorites.getCandidates(sourceCategory, {accessToken: user.token});
                const candidates = (resCan.data || []).map((can: any) => ({
                    id: `can-${can.venue_id}`,
                    venue: {
                        id: can.venue_id,
                        name: can.venue__name,
                        main_photo: can.venue_main_photo,
                        address: can.venue__address,
                        city: can.venue__city,
                        country: can.venue__country,
                    },
                    collection_id: "pool",
                    position: 0
                }));
                allItems = [...candidates];
            }

            const res:AxiosResponse = await venueServices.venues.favorites({accessToken: user.token})(user.id).getAll();
            const existing = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setItems([...allItems, ...existing]);

        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (user?.token) void loadData();
    }, [user?.token, sourceCategory]);

    const grouped = useMemo(() => {
        const map: Record<string, any[]> = { "pool": [] };
        collections.forEach(c => { map[String(c.id)] = []; });
        items.forEach(item => {
            const cid = String(item.collection_id);
            if (!map[cid]) map[cid] = [];
            map[cid].push(item);
        });
        Object.keys(map).forEach(key => {
            map[key].sort((a, b) => (a.position || 0) - (b.position || 0));
        });
        return map;
    }, [items, collections]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over || !user?.id || !user?.token) return;

        const activeIdStr = String(active.id);
        const overIdStr = String(over.id);
        let targetCollectionId: string;
        const overItem = items.find(i => String(i.id) === overIdStr);
        if (overIdStr === "pool" || overIdStr.startsWith("collection-")) {
            targetCollectionId = overIdStr.replace("collection-", "");
        } else if (overItem) {
            targetCollectionId = String(overItem.collection_id);
        } else {
            return;
        }

        const activeItem = items.find(i => String(i.id) === activeIdStr);
        if (!activeItem) return;
        let newItems = [...items];
        if (String(activeItem.collection_id) === targetCollectionId && overItem) {
            const columnItems = newItems
                .filter(i => String(i.collection_id) === targetCollectionId)
                .sort((a, b) => (a.position || 0) - (b.position || 0));

            const oldIndex = columnItems.findIndex(i => String(i.id) === activeIdStr);
            const newIndex = columnItems.findIndex(i => String(i.id) === String(overItem.id));

            const moved = arrayMove(columnItems, oldIndex, newIndex);
            moved.forEach((item, index) => {
                const idx = newItems.findIndex(i => String(i.id) === String(item.id));
                newItems[idx] = { ...item, position: index };
            });
        } else {
            newItems = newItems.map(item =>
                String(item.id) === activeIdStr
                    ? { ...item, collection_id: targetCollectionId, position: 0 }
                    : item
            );
            [targetCollectionId, String(activeItem.collection_id)].forEach(colId => {
                newItems
                    .filter(i => String(i.collection_id) === colId)
                    .sort((a, b) => (a.position || 0) - (b.position || 0))
                    .forEach((item, index) => {
                        const idx = newItems.findIndex(i => String(i.id) === String(item.id));
                        newItems[idx] = { ...item, position: index };
                    });
            });
        }

        setItems(newItems);
        if (targetCollectionId !== "pool") {
            try {
                const auth = { accessToken: user.token };
                const collectionItems = newItems
                    .filter(i => String(i.collection_id) === targetCollectionId)
                    .map((i, idx) => ({
                        id: String(i.id).replace("can-", ""),
                        position: idx,
                    }));

                await venueServices.collections({accessToken: user.token}).reorderItems(targetCollectionId, collectionItems);
            } catch (e) {
                console.error(e);
                void loadData();
            }
        }
    };

    const activeItem = items.find(i => String(i.id) === String(activeId));

    if (!user?.token) return null;

    return (
        <div className={styles.wrapper}>
            <TopCreateComponent
                role={user.role}
                viewMode={user.role === 'admin' ? 'official' : 'personal'}
                collections={collections}
                onCreated={loadData}
            />

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className={styles.columnsLayout}>

                    <DroppableCategory id="pool">
                        <h4 className={styles.title}>Pool: {sourceCategory}</h4>
                        <div className={styles.list}>
                            <SortableContext items={grouped["pool"].map(i => i.id)}
                                             strategy={horizontalListSortingStrategy}>
                                {grouped["pool"].map(item => (
                                    <SortableVenueItemComponent key={item.id} item={item}/>
                                ))}
                            </SortableContext>
                        </div>
                    </DroppableCategory>


                    {collections.map(col => {
                        const columnItems = grouped[String(col.id)] || [];
                        const hasItems = columnItems.length > 0;

                        return (
                            <DroppableCategory key={col.id} id={`collection-${col.id}`}>
                                <h4 className={styles.title}>
                                    {col.name}

                                    {hasItems && <span className={styles.countBadge}>({columnItems.length})</span>}
                                </h4>

                                <div className={styles.list}>
                                    <SortableContext
                                        items={columnItems.map(i => i.id)}
                                        strategy={horizontalListSortingStrategy}
                                    >
                                        {columnItems.map(item => (
                                            <SortableVenueItemComponent key={item.id} item={item}/>
                                        ))}

                                    </SortableContext>
                                </div>
                            </DroppableCategory>
                        );
                    })}
                </div>

                <DragOverlay>
                    {activeItem && (
                        <SortableVenueItemComponent
                            item={activeItem}
                            isOverlay
                        />
                    )}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default TopManagerComponent;


