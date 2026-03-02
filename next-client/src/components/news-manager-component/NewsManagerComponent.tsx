"use client"

import React, { useState, useEffect } from "react";
import venueServices from "@/lib/services/venueService";
import { useUser } from "@/app/contexts/UserProvider";
import styles from "./NewsManagerComponent.module.css";
import { NewItemFormComponent } from "@/components/new-item-form-component/NewItemFormComponent";
import { INewsPhoto} from "@/models/IVenue";
import {PaginationNewsComponent} from "@/components/pagination-news-component/PaginationNewsComponent";
import {NewComponent} from "@/components/new-component/NewComponent";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";

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

interface VenueNewsManagerProps {
    venueId: string;
}

const NewsManagerComponent: React.FC<VenueNewsManagerProps> = ({ venueId }) => {
    const { user } = useUser();
    const [newsGeneral, setNewsGeneral] = useState<NewsItem[]>([]);
    const [newsPromotion, setNewsPromotion] = useState<NewsItem[]>([]);
    const [newsEvent, setNewsEvent] = useState<NewsItem[]>([]);
    const [currentPageGeneral, setCurrentPageGeneral] = useState(1);
    const [currentPagePromotion, setCurrentPagePromotion] = useState(1);
    const [currentPageEvent, setCurrentPageEvent] = useState(1);
    const [totalNewsCountGeneral, setTotalNewsCountGeneral] = useState(0);
    const [totalNewsCountPromotion, setTotalNewsCountPromotion] = useState(0);
    const [totalNewsCountEvent, setTotalNewsCountEvent] = useState(0);
    const [itemsPerPage] = useState(8);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

  const fetchCategory = async (type: "general" | "promotion" | "event") => {
    if (!user?.token) return;
    const setNews = { general: setNewsGeneral, promotion: setNewsPromotion, event: setNewsEvent }[type];
    const setTotal = { general: setTotalNewsCountGeneral, promotion: setTotalNewsCountPromotion, event: setTotalNewsCountEvent }[type];
    const page = type === "general" ? currentPageGeneral : type === "promotion" ? currentPagePromotion : currentPageEvent;
    try {
        const res = await venueServices.venues.news({ accessToken: user.token })(venueId).getAll({
            page: page,
            limit: itemsPerPage,
            type: type,
            status:"",
        });

        if (res.data) {
            setNews(res.data.data || []);
            setTotal(res.data.total_items || 0);
        }
    } catch (error) {
        console.error(`Error fetching ${type}:`, error);
    }
};

useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        await fetchCategory(activeTab as any);
        setLoading(false);
    };
    void loadData();
}, [venueId, user?.token, activeTab, currentPageGeneral, currentPagePromotion, currentPageEvent, itemsPerPage]);


   const handleCreateNews = (news: NewsItem) => {
    void fetchCategory(news.type);
};

    const handleDeleteNews = async (newsId: string | number) => {
        if (!user?.token) return;
        try {
            await venueServices.venues.news({ accessToken: user.token })(venueId).delete(String(newsId));
            setNewsGeneral(prev => prev.filter(n => n.id !== newsId));
            setNewsPromotion(prev => prev.filter(n => n.id !== newsId));
            setNewsEvent(prev => prev.filter(n => n.id !== newsId));
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handlePageChange = (category: string, page: number) => {
        if (category === "general") setCurrentPageGeneral(page);
        if (category === "promotion") setCurrentPagePromotion(page);
        if (category === "event") setCurrentPageEvent(page);
    };

    const renderNews = (category: string) => {
    const config = {
        general: { total: totalNewsCountGeneral, page: currentPageGeneral, items: newsGeneral },
        promotion: { total: totalNewsCountPromotion, page: currentPagePromotion, items: newsPromotion },
        event: { total: totalNewsCountEvent, page: currentPageEvent, items: newsEvent },
    }[category as "general" | "promotion" | "event"];

    const totalPages = Math.ceil(config.total / itemsPerPage);

    if (loading) return <div className={styles.loaderWrapper}><LoaderComponent/></div>;

        return (
            <div className={styles.itemsWrapper}>
                <div className={styles.wrapperTitle}>
                    <h4 className={styles.bigText}>Promo</h4>
                    <p className={styles.mediumText}>News</p>
                    <p className={styles.smallText}>Events</p>
                </div>
                <div className={styles.newsSection}>
                   {config.items.map((news) => (
                        <NewComponent
                            key={news.id}
                            news={news}
                            venueId={venueId}
                            token={user?.token || ""}
                            onDelete={handleDeleteNews}
                            onUpdate={updatedNews => {
                                if (!updatedNews.type) return;
                                if (updatedNews.type === "general") {
                                    setNewsGeneral(prev => prev.map(n => n.id === updatedNews.id ? updatedNews : n));
                                } else if (updatedNews.type === "promotion") {
                                    setNewsPromotion(prev => prev.map(n => n.id === updatedNews.id ? updatedNews : n));
                                } else if (updatedNews.type === "event") {
                                    setNewsEvent(prev => prev.map(n => n.id === updatedNews.id ? updatedNews : n));
                                }
                            }}
                        />
                    ))}

                   <PaginationNewsComponent
                    totalPages={totalPages}
                    currentPage={config.page}
                    onPageChangeAction={(p: number) => handlePageChange(category, p)}
                />
                </div>
            </div>
        );
    };

    return (
        <div className={styles.typesWrapper}>
            <div className={styles.tabsContainer}>
                {["general", "promotion", "event"].map(tab => (
                    <div
                        key={tab}
                        className={`${styles.tabButton} ${activeTab === tab ? styles.active : ""}`}
                        onClick={() => {
                            setActiveTab(tab);
                            setCurrentPageGeneral(1);
                            setCurrentPagePromotion(1);
                            setCurrentPageEvent(1);
                        }}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </div>
                ))}
            </div>
            <div className={styles.wrapper}>
                {renderNews(activeTab)}
                <h4 className={styles.titleForm}>Add News</h4>
                <NewItemFormComponent venueId={venueId} onCreate={handleCreateNews} />
            </div>
        </div>
    );
};

export default NewsManagerComponent;

