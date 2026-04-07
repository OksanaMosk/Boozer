"use client"

import React, { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import {INews,  NewsType} from "@/models/IVenue";
import { NewItemFormComponent } from "@/components/new-item-form-component/NewItemFormComponent";
import {PaginationNewsComponent} from "@/components/pagination-news-component/PaginationNewsComponent";
import {NewComponent} from "@/components/new-component/NewComponent";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import styles from "./NewsManagerComponent.module.css";

interface VenueNewsManagerProps {
    venueId: string;
}
const NewsManagerComponent: React.FC<VenueNewsManagerProps> = ({venueId}) => {
    const {user} = useUser();
    const [news, setNews] = useState<INews[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<NewsType>("general");
    const itemsPerPage = 8;

    const fetchNews = async () => {
        if (!user?.token) return;
        setLoading(true);
        try {
            const res = await venueServices.venues.news({accessToken: user.token})(venueId).getAll({
                page: currentPage,
                limit: itemsPerPage,
                type: activeTab,
                status: "",
            });
            setNews(res.data.data || []);
            setTotalItems(res.data.total_items || 0);
        } catch {
            setNews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchNews();
    }, [venueId, activeTab, currentPage]);

    const handleCreateNews = () => {
        if (currentPage === 1) void fetchNews();
        else setCurrentPage(1);
    };

    const handleDeleteNews = async (newsId: string | number) => {
        if (!user?.token) return;
        try {
            await venueServices.venues.news({accessToken: user.token})(venueId).delete(String(newsId));
            void fetchNews();
        } catch {}
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className={styles.typesWrapper}>
            <div className={styles.wrapper}>
                <div className={styles.itemsWrapper}>
                    <div className={styles.wrapperTitle}>
                        <h4 className={styles.bigText}>Promo</h4>
                        <p className={styles.mediumText}>News</p>
                        <p className={styles.smallText}>Events</p>
                    </div>
                    <div className={styles.tabNavigation}>
                        {(["general", "promotion", "event"] as const).map(tab => (
                            <div
                                key={tab}
                                className={`${styles.navButton} ${activeTab === tab ? styles.activeTab : ""}`}

                                onClick={() => {
                                    setActiveTab(tab);
                                    setCurrentPage(1);
                                }}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </div>
                        ))}
                    </div>
                    <div className={styles.newsSection}>
                        {loading ? (
                            <div className={styles.loaderWrapper}><LoaderComponent /></div>
                        ) : (
                            <div className={styles.news}>
                                {news.map((item) => (
                                    <NewComponent
                                        key={item.id}
                                        news={item}
                                        onUpdate={fetchNews}
                                        venueId={venueId}
                                        token={user?.token || ""}
                                        isReadOnly={false}
                                        onDelete={handleDeleteNews}
                                    />
                                ))}

                                {totalPages > 1 && (
                                    <PaginationNewsComponent
                                        totalPages={totalPages}
                                        currentPage={currentPage}
                                        onPageChangeAction={setCurrentPage}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <h4 className={styles.titleForm}>Add News</h4>
                <NewItemFormComponent venueId={venueId}  onCreate={handleCreateNews}/>
            </div>
        </div>
    );
};

export default NewsManagerComponent;

