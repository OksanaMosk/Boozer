"use client"

import React, { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import {INews } from "@/models/IVenue";
import { PaginationNewsComponent } from "@/components/pagination-news-component/PaginationNewsComponent";
import { NewComponent } from "@/components/new-component/NewComponent";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import styles from "./NewsVisitorComponent.module.css";
import {ButtonScrollBottomComponent} from "@/components/button-scroll-bottom-component/ButtonScrollBottomComponent";
import Link from "next/link";


interface ClientNewsProps {
    venueId: string;
}

const NewsVisitorComponent: React.FC<ClientNewsProps> = ({ venueId }) => {
    const { user } = useUser();
    const [news, setNews] = useState<INews[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeTab, setActiveTab] = useState<"general" | "promotion" | "event">("general");
    const [loading, setLoading] = useState(false);

    const fetchNews = async () => {
        if (!user?.token) return;
        setLoading(true);
        try {
            const res = await venueServices.venues.news({ accessToken: user.token })(venueId).getAll({
                page: currentPage,
                type: activeTab,
                is_pinned: true
            });

           if (res.data) {
            setNews(res.data.data || []);
            setTotalPages(res.data.total_pages || 1);
        }

        } catch  {
          setNews([]);
        setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchNews();
    }, [venueId, user?.token, activeTab, currentPage]);



    if (!user?.token) {
        return <div className={styles.titleLog}>Please Sign In</div>;
    }

    return (
        <div className={styles.typesWrapper}>
            <ButtonScrollBottomComponent/>
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
                                {tab === "general" ? "News" : tab === "promotion" ? "Promo" : "Event"}
                            </div>
                        ))}
                    </div>
                    <div className={styles.newsSection}>
                        {loading ? (
                            <div className={styles.loaderWrapper}><LoaderComponent /></div>
                        ) : (
                            <>
                                {news.length > 0 ? (
                                    news.map((item) => (

                                        <Link
                                            href={`/venues/${venueId}/news/${item.id}`}
                                            key={item.id}
                                            className={styles.newsLink}
                                        >
                                            <NewComponent
                                                news={item}
                                                venueId={venueId}
                                                token={user?.token || ""}
                                                isReadOnly={true}
                                                onDelete={() => {
                                                }}
                                                onUpdate={() => {
                                                }}
                                            />
                                        </Link>
                                    ))
                                ) : (
                                    <p className={styles.emptyState}>There are no active news in this category at the
                                        moment</p>
                                )}

                            </>
                        )}
                    </div>

                </div>
                {totalPages > 1 && (
                    <PaginationNewsComponent
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChangeAction={(p: number) => setCurrentPage(p)}
                    />
                )}
            </div>

        </div>
    );
};

export default NewsVisitorComponent;
