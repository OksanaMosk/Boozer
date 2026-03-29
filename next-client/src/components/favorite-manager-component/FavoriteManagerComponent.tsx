"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import venueServices from "@/lib/services/venueService";
import { HeartIcon } from "@/components/HeartIcon";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";

import styles from "./FavoriteManagerComponent.module.css";
import {
    IFavoriteCollection,
    IFavoriteCollectionDetail,
    IFavoriteItem, TopCategoryType
} from "@/models/IReviewFeedback";
import {IVenue} from "@/models/IVenue";
import VenuesComponent from "@/components/venues-component/VenuesComponent";

interface Props {
    token: string;
    userId: string;
    role: string;
}

const INITIAL_CATEGORIES = [
    { value: "wedding", label: "Wedding" },
    { value: "corporate", label: "Corporate" },
    { value: "birthday", label: "Birthday" },
];

const normalize = (s?: string) => s?.toLowerCase().trim();

export const FavoriteManagerComponent: React.FC<Props> = ({ token }) => {
    const [collections, setCollections] = useState<IFavoriteCollection[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<IFavoriteCollectionDetail | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("");

    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [mounted, setMounted] = useState(false);

    const auth = {accessToken: token};

    const fetchCollections = async () => {
        try {
            const res = await venueServices.collections(auth).getAll();
            const data = (res.data as any)?.data || res.data || [];
            setCollections(data);

            if (!selectedCategory && data.length > 0) {
                setSelectedCategory(normalize(data[0].category) || "");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const allCategories = useMemo(() => {
        const base = [...INITIAL_CATEGORIES];

        collections.forEach(col => {
            const val = normalize(col.category);
            if (val && !base.find(c => c.value === val)) {
                base.push({
                    value: val,
                    label: col.category_display || col.category
                });
            }
        });

        return base;
    }, [collections]);

    const fetchCollectionDetails = async () => {
        if (!selectedCategory) return;

        const found = collections.find(
            c => normalize(c.category) === normalize(selectedCategory)
        );

        if (found && found.id != null) {
            try {
                const res = await venueServices.collections(auth).get(found.id);
                setSelectedCollection(res.data as IFavoriteCollectionDetail);
            } catch (e) {
                console.error(e);
            }
        } else {
            setSelectedCollection({
                id: "",
                name: selectedCategory,
                category: selectedCategory as TopCategoryType,
                category_display: selectedCategory,
                is_staff_top: false,
                items: [],
                venues: []
            });
        }
    };

    useEffect(() => {
        setMounted(true);
        void fetchCollections();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            void fetchCollectionDetails();
        }
    }, [selectedCategory]);

    const handleCreateList = async () => {
        if (!newListName.trim()) return;

        try {
            await venueServices.collections(auth).create({
                name: newListName,
                category: newListName
            });

            setNewListName("");
            setIsCreating(false);

            await fetchCollections();
            setSelectedCategory(normalize(newListName) || "");
        } catch (e) {
            console.error(e);
        }
    };

    const handleUnfavorite = async (venueId: string) => {
        try {
            await venueServices.venues.favorites(auth)(venueId).delete();

            if (selectedCollection) {
                setSelectedCollection({
                    ...selectedCollection,
                    items: selectedCollection.items.filter(
                        item => String(item.venue.id) !== venueId
                    )
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
    const handleVenueDeleted = (event: any) => {
        const deletedId = event.detail.venueId;
        setSelectedCollection(prev => {
            if (!prev) return null;
            return {
                ...prev,
                venues: prev.venues.filter(v => String(v.id) !== String(deletedId))
            };
        });
    };
    window.addEventListener('venue_unfavorited', handleVenueDeleted);
    return () => window.removeEventListener('venue_unfavorited', handleVenueDeleted);
}, []);

    const selectedCategoryLabel =
        allCategories.find(c => c.value === selectedCategory)?.label || "Favorites";

    if (loading) return <LoaderComponent/>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.topRow}>
                    <div className={styles.selectWrapper}>
                        <label className={styles.label}>Select list:</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className={styles.select}
                        >
                            {allCategories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        className={styles.createBtn}
                        onClick={() => setIsCreating(!isCreating)}
                    >
                        {isCreating ? "Cancel" : "+ Create list"}
                    </button>
                </div>

                {isCreating && (
                    <div className={styles.createBox}>
                        <input
                            className={styles.input}
                            placeholder="New list name..."
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            autoFocus
                        />
                        <button className={styles.saveBtn} onClick={handleCreateList}>
                            Save
                        </button>
                    </div>
                )}

                <div className={styles.infoRow}>
                    <h1 className={styles.title}>{selectedCategoryLabel}</h1>
                    <p className={styles.stats}>
                        ❤️ {selectedCollection?.venues?.length || 0} saved properties
                    </p>
                </div>
            </div>
            <div className={styles.grid}>
                {selectedCollection?.venues?.length ? (
                    <VenuesComponent
                        venues={selectedCollection.venues.map(v => ({
                            ...v,
                            is_favorite: true
                        }))}
                        totalPages={1}
                    />) : (<div className={styles.empty}>This list is empty.</div>
                )}
            </div>
        </div>
    );
}

export default FavoriteManagerComponent;