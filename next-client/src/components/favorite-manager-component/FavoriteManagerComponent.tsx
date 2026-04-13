"use client";
import React, { useEffect, useMemo, useState } from "react";
import venueServices from "@/lib/services/venueService";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import styles from "./FavoriteManagerComponent.module.css";
import {CATEGORY_LABELS,
    IFavoriteCollection,
    IFavoriteCollectionDetail,
    INITIAL_CATEGORIES,
    TopCategoryType
} from "@/models/IReviewFeedback";
import VenuesComponent from "@/components/venues-component/VenuesComponent";
import {useUser} from "@/app/contexts/UserProvider";

interface Props {
    userId: string;
}

const normalize = (s?: string) => s?.toLowerCase().trim() || "";

export const FavoriteManagerComponent: React.FC<Props> = () => {
    const [collections, setCollections] = useState<IFavoriteCollection[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<IFavoriteCollectionDetail | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [listLoading, setListLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {user} = useUser()
    useEffect(() => {
        if (user?.token) {
            void fetchCollections();
        }
    }, [user?.token])

    const fetchCollections = async () => {
        if (!user?.token) return
        setError(null);
        try {
            const res = await venueServices.collections({accessToken: user.token}).getAll();
            const data = (res.data as any)?.data || res.data || [];
            setCollections(data);
            if (!selectedCategory && data.length > 0) {
                setSelectedCategory(normalize(data[0]?.category) || "");
            }

        } catch (e) {
            setError("Failed to load favorite collections.");
        } finally {
            setLoading(false);
        }
    };

    const allCategories = useMemo(() => {
        const base = [...INITIAL_CATEGORIES];
        collections.forEach(col => {
            const val = normalize(col.category);
            if (val && !base.find(c => c.value === val)) {
                const displayLabel = col.category_display || (CATEGORY_LABELS as any)[val] || col.category;
            base.push({
                    value: val as TopCategoryType,
                label: displayLabel
            });
            }
        });

        return base;
    }, [collections]);

    const fetchCollectionDetails = async () => {
        if (!selectedCategory) return;
        setSelectedCollection(null);
         setListLoading(true);
        const found = collections.find(
            c => normalize(c.category) === normalize(selectedCategory)
        );

        if (found && found.id != null) {
            try {
                if (!user?.token) return
                const res = await venueServices.collections({accessToken: user.token}).get(found.id);
                setSelectedCollection(res.data as IFavoriteCollectionDetail);
            } catch (e) {
                 setError("Could not load collection details.");
            } finally {
                setListLoading(false);
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
             setListLoading(false);
        }

    };

    useEffect(() => {
        if (selectedCategory) {
            void fetchCollectionDetails();
        }
      }, [selectedCategory, collections]);

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
            <div className={styles.selectWrapper}>
                <h2 className={styles.title}>My Favorite Places</h2>
                <img className={styles.image} alt="logo" src="/favicon/android-chrome-192x192.png"/>
                  {error && <p className={styles.errorMessage}>{error}</p>}
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

            {listLoading ? (
                <div className={styles.listLoader}>
                    <LoaderComponent/>
                </div>
            ) : (
                <>
                    <p className={styles.infoRow}>
                        {selectedCollection?.venues?.length || 0} saved venues in category "{selectedCategoryLabel}"
                    </p>
                    <div className={styles.list}>
                        {selectedCollection?.venues?.length ? (
                            <VenuesComponent
                                venues={selectedCollection.venues.map(v => ({
                                    ...v,
                                    is_favorite: true
                                }))}
                                totalPages={1}/>) : (<div className={styles.empty}>This list is empty.</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default FavoriteManagerComponent;