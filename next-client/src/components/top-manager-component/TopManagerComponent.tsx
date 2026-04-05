"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {useSearchParams} from "next/navigation";

import {useUser} from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import styles from "./TopManagerComponent.module.css";

import DroppableCategory from "../droppable-category/DroppableCategory";
import TopCreateComponent from "@/components/top-create-component/TopCreateComponent";
import SortableVenueItemComponent from "@/components/sortable-venueI-item-component/SortableVenueItemComponent";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import TopHeaderCollection from "@/components/top-header-collection/TopHeaderCollection";

const TopManagerComponent = () => {
    const {user} = useUser();
    const searchParams = useSearchParams();
    const sourceCategory = searchParams.get("category");
    const targetColIdFromUrl = searchParams.get("colId");
    const [isLoading, setIsLoading] = useState(true);
    const [collections, setCollections] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [activeId, setActiveId] = useState<string | number | null>(null);
    const [dragPoolMessage, setDragPoolMessage] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {activationConstraint: {distance: 8}})
    );

    const loadData = useCallback(async () => {
        if (!user?.token || !user?.id) {
            setIsLoading(false);
            return;
        }
        const auth = {accessToken: user.token};
        setIsLoading(true);
        try {
            const [resCols, resStaff] = await Promise.all([
                venueServices.collections(auth).getAll(),
                venueServices.collections(auth).staffTop(),
            ]);

            const userCols = resCols.data?.data || resCols.data || [];
            const staffRaw = resStaff.data || [];
            const staffCols = (Array.isArray(staffRaw) ? staffRaw : [staffRaw]).map((cat: any) => ({
                ...cat,
                is_staff_top: true,
            }));

            const combined = [...userCols, ...staffCols];
            const filteredCols = combined.filter((col: any) => {
                return String(col.id) === String(targetColIdFromUrl) || col.is_staff_top === true;
            });

            const uniqueCols = Array.from(
                new Map(filteredCols.map((c: any) => [c.id, c])).values()
            );
            setCollections(uniqueCols);
            let candidates: any[] = [];
            if (sourceCategory) {
                const resCan = await venueServices.favorites.getCandidates(sourceCategory, auth);
                const canData = resCan.data?.data || resCan.data || [];
                candidates = canData.map((can: any) => ({
                    id: can.venue_id,
                    venue: {
                        id: can.venue_id,
                        name: can.venue__name,
                        main_photo: can.venue_main_photo,
                        address: can.venue__address,
                        city: can.venue__city,
                        country: can.venue__country,
                        total_votes: can.total_votes,
                    },
                    collection_id: "pool",
                    position: 0,
                }));
            }

            const resExisting = await venueServices.venues.favorites(auth)(user.id).getAll();
            const existingRaw = resExisting.data || [];
            const existingFormatted = (Array.isArray(existingRaw) ? existingRaw : []).map((item: any) => ({
                ...item,
                id: item.venue?.id || item.venue_id,
                collection_id: item.collection_id,
            }));

            const staffVenuesFormatted = staffCols.flatMap((cat: any) => {
                const venues = cat.venues || [];
                return venues.map((v: any, index: number) => {
                    const mainPhotoObj = (v.photos || []).find((p: any) => p.is_main) || (v.photos && v.photos[0]);
                    return {
                        id: v.id,
                        venue: {
                            id: v.id,
                            name: v.name,
                            main_photo: mainPhotoObj ? mainPhotoObj.photo : null,
                            address: v.address || "",
                            city: v.city || "",
                            country: v.country || "",
                            total_votes: v.reviews_count || v.rating || 0,
                        },
                        collection_id: String(cat.id),
                        position: v.position || index + 1,
                        is_staff_item: true,
                    };
                });
            });

            const existingIds = new Set([
                ...existingFormatted.map((item: any) => String(item.id)),
                ...staffVenuesFormatted.map((item: any) => String(item.id)),
            ]);
            const filteredCandidates = candidates.filter((can: any) => !existingIds.has(String(can.id)));

            setItems([...filteredCandidates, ...existingFormatted, ...staffVenuesFormatted]);
        } catch (e) {
            console.error("Error loadData:", e);
        } finally {
            setIsLoading(false);
        }
    }, [user?.token, user?.id, sourceCategory, targetColIdFromUrl]);

    useEffect(() => {
        if (user?.token) void loadData();
    }, [loadData]);

    const grouped = useMemo(() => {
        const map: Record<string, any[]> = {pool: []};
        collections.forEach((c) => {
            map[String(c.id)] = [];
        });

        items.forEach((item) => {
            const cid = item.collection_id === "pool" ? "pool" : String(item.collection_id);
            if (map[cid]) map[cid].push(item);
        });

        Object.keys(map).forEach((key) => {
            map[key].sort((a, b) => (a.position || 0) - (b.position || 0));
        });
        return map;
    }, [items, collections]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const {active, over} = event;
        setActiveId(null);
        const token = user?.token;
        if (!over || !token) return;
        const activeIdStr = String(active.id);
        const overIdStr = String(over.id);
        const oldIndex = items.findIndex((i) => String(i.id) === activeIdStr);
        const newIndex = items.findIndex((i) => String(i.id) === overIdStr);
        if (oldIndex === -1) return;
        const activeItem = items[oldIndex];
        let targetColId: string;

        const overItem = items.find((i) => String(i.id) === overIdStr);
        if (overIdStr === "pool") {
            targetColId = "pool";
        } else if (overItem) {
            targetColId = String(overItem.collection_id);
        } else {
            targetColId = overIdStr;
        }
        if (targetColId === "pool") {
            setDragPoolMessage("Cannot move items back to Pool! Use Delete from collection instead.");
            setTimeout(() => setDragPoolMessage(null), 4000);
            return;
        }
        const currentCid = String(activeItem.collection_id);
        if (currentCid === targetColId) {
            if (activeIdStr === overIdStr) return;
            const newItems = arrayMove(items, oldIndex, newIndex);
            const updatedWithPositions = newItems.map((item) => {
                if (String(item.collection_id) === targetColId) {
                    const indexInCol = newItems
                        .filter(i => String(i.collection_id) === targetColId)
                        .indexOf(item);
                    return {...item, position: indexInCol + 1};
                }
                return item;
            });
             setItems(updatedWithPositions);
            if (targetColId !== "pool") {
                const payload = updatedWithPositions
                    .filter(i => String(i.collection_id) === targetColId)
                    .map((item, idx) => ({
                        id: item.id,
                        position: idx + 1
                    }));
                try {
                    await venueServices.collections({accessToken: token}).reorderItems(targetColId, payload);
                } catch (e) {
                    console.error("Reorder error:", e);
                    void loadData();
                }
            }
            return;
        }
        {
            const targetColNum = Number(targetColId);

            const updatedItems = items.map((item) =>
                String(item.id) === activeIdStr
                    ? {...item, collection_id: targetColNum, position: 999}
                    : item
            );

            setItems(updatedItems);
            if (currentCid !== "pool" && currentCid !== targetColId) {
                venueServices.collections({accessToken: token}).removeVenue(currentCid, activeItem.venue.id)
                    .catch(e => console.error("Remove old error", e));
            }
            venueServices.venues.favorites({accessToken: token})(activeItem.venue.id).add({
                venue: activeItem.venue.id,
                collection_id: targetColNum,
                collection_category: sourceCategory || undefined,
            } as any)
                .then(() => {
                 const newColItems = updatedItems
                        .filter(i => String(i.collection_id) === targetColId || String(i.id) === activeIdStr)
                        .map((i, idx) => ({id: i.id, position: idx + 1}));
                    return venueServices.collections({accessToken: token}).reorderItems(targetColId, newColItems);
                })
                .catch(() => {
                    void loadData();
                });
            return;
        }
    }

    const handleDelete = async (venueId: string | number,
                                collectionId: string | number) => {
        if (!user?.token) return;
        const deletedItem = items.find(i =>
            String(i.venue.id) === String(venueId) &&
            String(i.collection_id) === String(collectionId)
        );

        setItems(prev => [
            ...prev.filter(i =>
                !(String(i.venue.id) === String(venueId) &&
                    String(i.collection_id) === String(collectionId))
            ),
            ...(deletedItem
                ? [{...deletedItem, collection_id: "pool", position: 0}]
                : [])
        ]);

        try {
            await venueServices.collections({accessToken: user.token})
                .removeVenue(collectionId, venueId);
        } catch (e) {
            void loadData();
        }
    };
    const activeItem = items.find((i) => String(i.id) === String(activeId));
    if (!user?.token) return null;

    return (
        <div className={styles.wrapper}>
            <TopCreateComponent
                onCreated={loadData}
            />
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}  autoScroll={false} >
        <div className={styles.columnsLayout}>
          <DroppableCategory id="pool">
            <h4 className={styles.title}>Pool: {sourceCategory}</h4>
            {isLoading ? <LoaderComponent/> : (!grouped["pool"].length && (<p className={styles.dragPoolMessage} >No more venues to add — all are already in the TOPs</p>))}
            <div className={styles.list}>
              <SortableContext items={grouped["pool"].map((i) => i.id)} strategy={verticalListSortingStrategy}>
                {grouped["pool"].map((item, index) => (
                    <SortableVenueItemComponent
                        key={item.id}
                        item={item}
                        position={index + 1}
                        showIndex={false}/>
                ))}
              </SortableContext>

            </div>
              {dragPoolMessage && (
                    <p className={styles.dragPoolMessage}>
                        {dragPoolMessage}
                    </p>
                )}
          </DroppableCategory>
            {collections.map((col) => {
                const colId = String(col.id);
                const colItems = grouped[colId] || [];
                return (
                    <DroppableCategory key={colId} id={colId}>
                        <TopHeaderCollection
                            collection={col}
                            token={user.token!}
                            onUpdate={loadData}
                        />

                        <div className={styles.list}>
                  <SortableContext items={colItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                    {colItems.map((item, index) => (
                        <SortableVenueItemComponent
                            key={item.id}
                            item={item}
                            position={index + 1}
                            showIndex={col.is_staff_top}
                          onDelete={() => handleDelete(item.venue.id, item.collection_id)}
                        />
                    ))}
                  </SortableContext>
                </div>
              </DroppableCategory>
            );
          })}
        </div>

        <DragOverlay>
            {activeId && activeItem ? (
                <SortableVenueItemComponent
                    item={activeItem}
                    position={0}
                    isOverlay
                />
            ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default TopManagerComponent;