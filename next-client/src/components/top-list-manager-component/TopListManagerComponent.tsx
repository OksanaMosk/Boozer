"use client";
import styles from "./TopListManagerComponent.module.css";
import React, { useEffect, useState, useCallback } from "react";
import venueServices from "@/lib/services/venueService";
import { useRouter } from "next/navigation";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import { useUser } from "@/app/contexts/UserProvider";

interface Props {
    userId: string;
}

export const TopListManagerComponent: React.FC<Props> = () => {
    const router = useRouter();
    const { user } = useUser();
    const [collections, setCollections] = useState<any[]>([]);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [activeCandidateColId, setActiveCandidateColId] = useState<string | null>(null);

    const loadData = useCallback(async () => {
           if (!user?.token || collections.length > 0) return;
    try {
        if (!user?.token) return
        const res = await venueServices.collections({accessToken: user.token}).mostHearted();
        setCollections(res.data || []);

    } catch (e) {

        setCollections([]);
    }
}, [user?.token]);

useEffect(() => {
    void loadData();
}, [loadData]);

    const handleShowCandidates = async ( category: string) => {
        if (!user?.token) return;
        if (activeCandidateColId === category) {
            setActiveCandidateColId(null);
            setCandidates([]);
            return;
        }

        try {
            setLoadingCandidates(true);
            setCandidates([]);
            setActiveCandidateColId(category);
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
    const normalize = (s?: string) => s?.toLowerCase().trim() || "";
    const formatCategory = (s?: string) => {
        const n = normalize(s);
        if (!n) return "Other";
        return n.charAt(0).toUpperCase() + n.slice(1);
    };

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <h2 className={styles.title}>MAX 5 Most Hearted collections by users to form 'Staff TOP' categories.</h2>
                <ul className={styles.list} >
                    {collections.map(col => (
                    <li key={col.category} className={styles.collectionCard}>
                            <h3 className={styles.categoryLabel}>
                                Category: {formatCategory(col.category)}
                            </h3>
                            <p className={styles.total}>{col.total_hearts} 💛</p>
                        <div className={styles.buttonGroup}>
                            <button
                                className={styles.openBtn}
                                onClick={() => router.push(`/admin/top-create?category=${col.category}`)}
                            >
                                Open & Add to Top
                            </button>
                            <button
                                className={styles.candidateBtn}
                                onClick={() => handleShowCandidates( col.category)}
                            >
                               Open Candidates Venue
                            </button>
                        </div>

                       {activeCandidateColId === col.category && (
                            <div className={styles.candidatesDropdown}>
                                <h4 className={styles.candidatesTitle}>TOP Candidates:</h4>

                                {loadingCandidates ?
                                   ( <div className={styles.loader}>
                                        <LoaderComponent/>
                                    </div>): (
                                    <ul className={styles.candidatesList}>
                                        {candidates.length > 0 ? (
                                            candidates.map(can => (
                                                <li key={can.venue_id} className={styles.candidate}>
                                                    <p className={styles.candidateP}>{can.venue__name} </p>
                                                    <p className={styles.candidateP}> {can.total_votes} 💛</p>
                                                </li>
                                            ))
                                        ) : (
                                            <p>No candidates found for this category.</p>
                                        )}
                                    </ul>
                                )}
                            </div>
                        )}
                    </li>
                ))}</ul>
            </div>
        </div>
    );
};