"use client"

import React, { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import { INewsPhoto } from "@/models/IVenue";
import { PaginationNewsComponent } from "@/components/pagination-news-component/PaginationNewsComponent";
import { NewComponent } from "@/components/new-component/NewComponent";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import styles from "./NewsVisitorComponent.module.css";

interface NewsItem {
    id?: number | string;
    title: string;
    content: string;
    type: "general" | "promotion" | "event";
    status: string;
    end_date?: string | null;
    is_pinned: boolean;
    images?: INewsPhoto[] | [];
    preview?: string | null;
    created_at?: string;
    updated_at?: string;
}

interface ClientNewsProps {
    venueId: string;
}

const NewsVisitorComponent: React.FC<ClientNewsProps> = ({ venueId }) => {
    const { user } = useUser();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [activeTab, setActiveTab] = useState<"general" | "promotion" | "event">("general");
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 8;

    const fetchNews = async () => {
        if (!user?.token) return;
        setLoading(true);
        try {
            const res = await venueServices.venues.news({ accessToken: user.token })(venueId).getAll({
                page: currentPage,
                limit: itemsPerPage,
                type: activeTab,
                is_pinned:true
            });

            if (res.data) {
                const now = new Date();
                const activeNews = (res.data.data || []).filter((item: NewsItem) => {
                    if (!item.end_date) return true;
                    return new Date(item.end_date) >= now;
                });

                setNews(activeNews);
                setTotalItems(res.data.total_items || 0);
            }
        } catch (error) {
            console.error(`Error fetching visitor news:`, error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchNews();
    }, [venueId, user?.token, activeTab, currentPage]);

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className={styles.typesWrapper}>
            <div className={styles.tabsContainer}>
                {(["general", "promotion", "event"] as const).map(tab => (
                    <div
                        key={tab}
                        className={`${styles.tabButton} ${activeTab === tab ? styles.active : ""}`}
                        onClick={() => {
                            setActiveTab(tab);
                            setCurrentPage(1);
                        }}
                    >
                        {tab === "general" ? "News" : tab === "promotion" ? "Promo" : "Event"}
                    </div>
                ))}
            </div>

            <div className={styles.wrapper}>
                <div className={styles.itemsWrapper}>
                    <div className={styles.wrapperTitle}>
                        <h4 className={styles.bigText}>Promo</h4>
                        <p className={styles.mediumText}>News</p>
                        <p className={styles.smallText}>Events</p>
                    </div>

                    <div className={styles.newsSection}>
                        {loading ? (
                            <div className={styles.loaderWrapper}><LoaderComponent /></div>
                        ) : (
                            <>
                                {news.length > 0 ? (
                                    news.map((item) => (
                                        <NewComponent
                                            key={item.id}
                                            news={item}
                                            venueId={venueId}
                                            token={user?.token || ""}
                                            isReadOnly={true}
                                            onDelete={() => {
                                            }}
                                            onUpdate={() => {
                                            }}
                                        />
                                    ))
                                ) : (
                                    <p className={styles.emptyState}>There are no active news in this category at the moment</p>
                                )}

                                {totalPages > 1 && (
                                    <PaginationNewsComponent
                                        totalPages={totalPages}
                                        currentPage={currentPage}
                                        onPageChangeAction={(p: number) => setCurrentPage(p)}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsVisitorComponent;