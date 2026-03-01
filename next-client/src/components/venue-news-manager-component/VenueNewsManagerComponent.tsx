"use client";

import React, {useState, useEffect} from "react";
import venueServices from "@/lib/services/venueService";
import {useUser} from "@/app/contexts/UserProvider";
import {AxiosResponse} from "axios";
import styles from "./VenueNewsManagerComponent.module.css"
import {NewItemForm} from "@/components/new-item-form/NewItemForm";
import {PaginationComponent} from "@/components/pagination-component/PaginationComponent";

interface NewsItem {
    id: string | number;
    title: string;
    content: string;
    type: "general" | "promotion" | "event";
    status: string;
    end_date?: string | null;
    is_pinned: boolean;
    preview?: string | null;
}

interface VenueNewsManagerProps {
    venueId: string;
}

const VenueNewsManagerComponent: React.FC<VenueNewsManagerProps> = ({venueId}) => {
    const {user} = useUser();
    const [newsList, setNewsList] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchNews = async () => {
        if (!user?.token) return;
        setLoading(true);
        try {
            const res: AxiosResponse = await venueServices.venues.news({accessToken: user.token})(venueId).getAll();
            setNewsList(res.data.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchNews();
    }, [venueId, user?.token]);

    const handleCreateNews = (news: NewsItem) => {
        setNewsList(prev => [news, ...prev]);
    };

    const handleDeleteNews = async (newsId: string | number) => {
        if (!user?.token) return;
        try {
            await venueServices.venues.news({accessToken: user.token})(venueId).delete(String(newsId));
            setNewsList(prev => prev.filter(n => n.id !== newsId));
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    return (
        <div className={styles.itemsWrapper}>
            <div className={styles.wrapperTitle}>
                <h4 className={styles.bigText}>
                    News
                </h4>
                <div className={styles.smallText}>
                    list
                </div>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className={styles.categoryGroup}>
                    {newsList.map(news => (
                        <div key={news.id} className={styles.sortableItemWrapper}>
                            <div className={styles.subTitle}>{news.title}</div>
                            <div>
                                <small>Type: {news.type}</small>
                                <br/>
                                <small>Status: {news.status}</small>
                                <br/>
                                {news.end_date && <small>End: {news.end_date}</small>}
                                <br/>
                                {news.preview && <img src={news.preview} alt={news.title} style={{maxWidth: "200px"}} />}
                            </div>
                            <button
                                className={styles.deleteButton}
                                onClick={() => void handleDeleteNews(news.id)}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
{/*<PaginationComponent totalPages={totalPages}/>*/}
            <h4 className={styles.titleForm}>Add News</h4>
            <NewItemForm venueId={venueId} onCreate={handleCreateNews} />
        </div>
    );
};

export default VenueNewsManagerComponent;