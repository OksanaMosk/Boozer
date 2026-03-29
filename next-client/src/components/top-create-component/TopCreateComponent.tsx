"use client";

import React, { useState } from "react";
import venueServices from "@/lib/services/venueService";
import {CATEGORY_LABELS, INITIAL_CATEGORIES, TopCategoryType} from "@/models/IReviewFeedback";
import {useUser} from "@/app/contexts/UserProvider";

interface Props {
    role: string;
    viewMode: 'official' | 'personal';
    collections: any[];
    onCreated: () => void;
}

const TopCreateComponent: React.FC<Props> = ({
    role,
    viewMode,
    collections,
    onCreated
}) => {
     const { user } = useUser();
    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [selectedCat, setSelectedCat] = useState("general");
    const [customCat, setCustomCat] = useState("");
    const [isCustom, setIsCustom] = useState(false);

    const dynamicCategories = [
        ...INITIAL_CATEGORIES,
        ...(collections || [])
            .map(c => ({
              value: c.category as TopCategoryType,
            label: c.category_display || CATEGORY_LABELS[c.category as TopCategoryType] || c.category
            }))
            .filter(
                (c, i, arr) =>
                    c.value &&
                    arr.findIndex(a => a.value === c.value) === i &&
                    !INITIAL_CATEGORIES.find(ic => ic.value === c.value)
            )
    ];

    const handleCreate = async () => {
        const isOfficial = role === 'admin' && viewMode === 'official';
        const finalCategory = isCustom ? customCat.trim() : selectedCat;
        const finalName = isOfficial ? newName.trim() : finalCategory;

        if (!finalName || !finalCategory) return;

        try {
             if (!user?.token) return;
            await venueServices.collections({accessToken: user.token}).create({
                name: finalName,
                category: finalCategory,
                is_staff_top: isOfficial
            });

            // reset
            setNewName("");
            setCustomCat("");
            setIsCustom(false);
            setSelectedCat("general");
            setShowForm(false);

            onCreated();
        } catch (e) {
            console.error("Create error:", e);
        }
    };

    return (
        <div>
            <button onClick={() => {
                setShowForm(prev => !prev);
                setIsCustom(false);
            }}>
                {showForm ? "✕ Cancel" : "+ Create TOP"}
            </button>

            {showForm && (
                <div>
                    {role === 'admin' && viewMode === 'official' && (
                        <input
                            placeholder="TOP name (e.g. Best of 2026)"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                    )}

                    {!isCustom ? (
                        <select
                            value={selectedCat}
                            onChange={(e) => {
                                if (e.target.value === "custom") {
                                    setIsCustom(true);
                                } else {
                                    setSelectedCat(e.target.value);
                                }
                            }}
                        >
                            {dynamicCategories.map(c => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                            <option value="custom">+ New Category...</option>
                        </select>
                    ) : (
                        <div>
                            <input
                                placeholder="Enter category..."
                                value={customCat}
                                onChange={(e) => setCustomCat(e.target.value)}
                                autoFocus
                            />
                            <button onClick={() => {
                                setIsCustom(false);
                                setCustomCat("");
                            }}>
                                Back
                            </button>
                        </div>
                    )}

                    <button onClick={handleCreate}>
                        Save
                    </button>
                </div>
            )}
        </div>
    );
};

export default TopCreateComponent;