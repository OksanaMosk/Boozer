"use client";
import styles from "./TopListManagerComponent.module.css";
import React, { useEffect, useState, useCallback } from "react";
import venueServices from "@/lib/services/venueService";
import { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import { useUser } from "@/app/contexts/UserProvider";

interface Props {
    token: string;
    userId: string;
}

export const TopListManagerComponent: React.FC<Props> = ({ token }) => {
    const router = useRouter();
    const { user } = useUser();
    const [collections, setCollections] = useState<any[]>([]);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [activeCandidateColId, setActiveCandidateColId] = useState<string | null>(null);
    const auth = { accessToken: token };
    const loadData = useCallback(async () => {
        try {
            const res: AxiosResponse = await venueServices.collections(auth).getAll();
            setCollections(res.data.data || res.data || []);
        } catch (e) {
            console.error("Load error:", e);
            setCollections([]);
        }
    }, [token]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const handleShowCandidates = async (colId: string, category: string) => {
        if (!user?.token) return;

        if (activeCandidateColId === colId) {
            setActiveCandidateColId(null);
            setCandidates([]);
            return;
        }

        try {
            setLoadingCandidates(true);
            setActiveCandidateColId(colId);
            const res = await venueServices.favorites.getCandidates(category, { accessToken: user.token });

            if (res.data && Array.isArray(res.data)) {
                setCandidates(res.data);
            } else {
                setCandidates([]);
            }
        } catch (e) {
            setCandidates([]);
        } finally {
            setLoadingCandidates(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
            </div>

            <div className={styles.grid}>
                {collections.map(col => (
                    <div key={col.id} className={styles.collectionCard}>
                        <div className={styles.cardInfo}>
                            <h3 className={styles.collectionName}>{col.name || col.category}</h3>
                            <p className={styles.categoryLabel}>Category: {col.category}</p>
                        </div>

                        <div className={styles.buttonGroup}>
                            <button
                                className={styles.openBtn}
                                   onClick={() => router.push(`/admin/top-create?colId=${col.id}&category=${col.category}`)}
                            >
                                Open & Sort
                            </button>
                            <button
                                className={styles.candidateBtn}
                                onClick={() => handleShowCandidates(col.id, col.category)}
                            >
                                Candidates Venue
                            </button>
                        </div>

                        {activeCandidateColId === col.id && (
                            <div className={styles.candidatesDropdown}>
                                <h4>Top Candidates:</h4>
                                {loadingCandidates ? <LoaderComponent /> : (
                                    <div className={styles.candidatesList}>
                                        {candidates.length > 0 ? (
                                            candidates.map(can => (
                                                <div key={can.venue_id} className={styles.candidateRow}>
                                                    <span>{can.venue__name} ({can.total_votes} 🗳️)</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p>No candidates found for this category.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
