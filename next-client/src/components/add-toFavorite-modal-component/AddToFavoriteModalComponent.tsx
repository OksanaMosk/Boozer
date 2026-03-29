"use client";
import React, { useState, useEffect, useMemo } from 'react';
import venueServices from "@/lib/services/venueService";
import styles from "./AddToFavoriteModalComponent.module.css";

const INITIAL_CATEGORIES = [
    { value: 'wedding', label: 'Wedding' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'birthday', label: 'Birthday' },
];
export const AddToFavoriteModalComponent = ({ venueId, onClose, token, onSuccess }: any) => {
    const [userCollections, setUserCollections] = useState<any[]>([]);
    const [selectedCat, setSelectedCat] = useState("");
    const [isCustom, setIsCustom] = useState(false);
    const [newCatName, setNewCatName] = useState("");
    const auth = { accessToken: token };

    useEffect(() => {
        const fetchExisting = async () => {
            try {
                const res = await venueServices.collections(auth).getAll();
                setUserCollections(res.data.data || res.data || []);
            } catch (e) { console.error(e); }
        };
        void fetchExisting();
    }, []);

    const allCategories = useMemo(() => {
        const base = [...INITIAL_CATEGORIES];
        userCollections.forEach(col => {
            const val = col.category?.toLowerCase();
            if (val && !base.find(c => c.value === val)) {
                base.push({ value: val, label: col.category_display || col.category });
            }
        });
        return base;
    }, [userCollections]);

    const handleFinalSave = async (category: string) => {
        if (!category) return;
        try {
            const catValue = category.toLowerCase().trim();
            const existingCol = userCollections.find(c => c.category?.toLowerCase() === catValue);

            const payload: any = {
                venue: venueId,
                collection_category: catValue,
            };
            if (existingCol) {
                payload.collection_id = existingCol.id;
            } else {
                payload.new_collection_name = category;
            }
            await venueServices.venues.favorites(auth)(String(venueId)).add(payload);
            if (onSuccess) onSuccess();
            onClose();
        } catch (e) {
            console.error("Save error:", e);
        }
    };

    return (
        <div className={styles.overlay} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal}>
                <p className={styles.title}>Save in...</p>
                {!isCustom ? (
                    <div className={styles.selectWrapper}>
                        <select
                            className={styles.select}
                            value={selectedCat}
                            onChange={(e) => {
                                if (e.target.value === "add_new") {
                                    setIsCustom(true);
                                } else {
                                    setSelectedCat(e.target.value);
                                }
                            }}
                        >
                            <option value="" disabled>Select category...</option>
                            {allCategories.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}Fnew
                            <option value="add_new" className={styles.addNewOption}>+ Add Your Category</option>
                        </select>

                        <button
                            className={styles.saveBtn}
                            disabled={!selectedCat}
                            onClick={() => handleFinalSave(selectedCat)}
                        >
                           ✓
                        </button>
                    </div>
                ) : (
                    <div className={styles.customInputRow}>
                        <input
                            className={styles.input}
                            placeholder="Add category..."
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            autoFocus
                        />
                        <div className={styles.buttons}>
                            <button className={styles.button} onClick={() => handleFinalSave(newCatName)}>Add & Save</button>
                            <button className={styles.button} onClick={() => setIsCustom(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                <button className={styles.closeX} onClick={onClose}>Close</button>
            </div>
        </div>
    );
};