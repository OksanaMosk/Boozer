"use client"

import React, { useState, useEffect, Suspense } from "react";
import { useUser } from "@/app/contexts/UserProvider";
import { useSearchParams, useRouter } from "next/navigation";
import venueServices from "@/lib/services/venueService";
import { INews } from "@/models/IVenue";
import { NewComponent } from "@/components/new-component/NewComponent";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import { ButtonScrollTopComponent } from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import styles from "./NewsGlobalComponent.module.css";
import {PaginationComponent} from "@/components/pagination-component/PaginationComponent";
import {ButtonScrollBottomComponent} from "@/components/button-scroll-bottom-component/ButtonScrollBottomComponent";
import Link from "next/link";

const NewsGlobalContent = () => {
    const { user } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [news, setNews] = useState<INews[]>([]);
    const [activeTab, setActiveTab] = useState("all");
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const currentPage = Number(searchParams.get("page") || "1");


    const fetchAllNews = async () => {
        if (!user?.token) return;
        setLoading(true);
        try {
            const res = await venueServices.allNews.list({
                page: currentPage,
                type: activeTab === "all" ? "" : activeTab,
                is_pinned: true
            }, {accessToken: user?.token});

            if (res.data.data) {
                const processedNews: INews[] = (res.data.data || [])
                    .map((item: INews) => ({
                        ...item,
                        displayType: item.type === 'promotion' ? 'PROMO' : item.type === 'event' ? 'EVENT' : 'NEWS'
                    }));

                setNews(processedNews);
                setTotalPages(res.data.total_pages || 1);
            }
        } catch {
            setNews([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user?.token) return;
        void fetchAllNews();
    }, [activeTab, currentPage, user?.token]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", "1");
        router.push(`?${params.toString()}`);
    };

    if (!user?.token) {
        return <div className={styles.title}>Please Sign In</div>;
    }

    return (
        <div className={styles.container}>
             <ButtonScrollBottomComponent/>
            <h1 className={styles.mainTitle}>News Feed & Promotions</h1>

            <div className={styles.tabNavigation}>
                {["all", "general", "promotion", "event"].map(t => (
                    <button
                        key={t}
                        aria-label="Tab news"
                        className={`${styles.navButton} ${activeTab === t ? styles.activeTab : ""}`}
                        onClick={() => handleTabChange(t)}
                    >
                        {t === "all" ? "All" : t === "promotion" ? "Promotions" : t === "event" ? "Events" : "General"}
                    </button>
                ))}
            </div>
            {loading ? <LoaderComponent/> : (
                <div className={styles.list}>
                    {news.length > 0 ? (
                        news.map(item => (
                            <div key={item.id} className={styles.itemWrapper}>
                                <Link href={`/news/${item.id}`}>
                                    <span className={styles.newsBadge}>
                                        {item.type === 'promotion' ? 'PROMO' : item.type === 'event' ? 'EVENT' : 'NEWS'}
                                </span>

                                    <NewComponent
                                        news={item}
                                        venueId={String(item.venue || "")}
                                        token={user?.token || ""}
                                        isReadOnly={true}
                                        onDelete={() => {
                                        }}
                                        onUpdate={() => {
                                        }}
                                    />
                                </Link>
                            </div>
                        ))
                    ) : (
                        <p className={styles.emptyState}>No active news found...</p>
                    )}
                </div>
            )}
            {totalPages > 1 && (
                <PaginationComponent totalPages={totalPages}/>)}
            <ButtonScrollTopComponent/>
        </div>
    );
};

export const NewsGlobalComponent = () => (
    <Suspense fallback={<LoaderComponent />}>
        <NewsGlobalContent />
    </Suspense>
);
