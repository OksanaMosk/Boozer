"use client";

import React, {useEffect, useState} from "react";
import { useUser } from "@/app/contexts/UserProvider";
import { NewsGalleryComponent } from "@/components/news-gallery-compopnent/NewsGalleryComponent";
import styles from "./NewSingleComponent.module.css";
import {INews} from "@/models/IVenue";
import venueServices from "@/lib/services/venueService";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import {AxiosResponse} from "axios";

interface NewSingleComponentProps {
    newsId: string;
    preloadedData?: INews;
}

export const NewSingleComponent = ({ newsId, preloadedData }: NewSingleComponentProps) => {
    const { user } = useUser();
    const [newsItem, setNewsItem] = useState<INews | null>(preloadedData || null);
    const [loading, setLoading] = useState(!preloadedData);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (preloadedData) return;
        const fetchItem = async () => {
            if (!user?.token || !newsId) return;
            setLoading(true);
            setError(null);
            try {
                const res: AxiosResponse = await venueServices.allNews.get(newsId, {accessToken: user.token});
                setNewsItem(res.data);
            } catch (error) {
                setError("Failed to fetch news item");
            } finally {
                setLoading(false);
            }
        };

        void fetchItem();
    }, [newsId, user?.token, preloadedData]);

    if (loading) return <LoaderComponent />;
    if (!newsItem) return <p style={{textAlign: 'center'}}>New not found.</p>;


    const images = newsItem.images || [];
    const coverImage = images.find((img: any) => img.is_cover)?.image;


    return (
        <div className={styles.newsCard}>
             <span className={styles.newsBadge}>
                 {newsItem.type === 'promotion' ? 'PROMO' : newsItem.type === 'event' ? 'EVENT' : 'NEWS'}
             </span>
            <p className={styles.error} >{error}</p>
            <div className={styles.top}>
                    <div className={styles.subTitlePin}>
                        {newsItem.is_pinned && <span title="Pinned" className={styles.pinned}>🎊</span>}
                        {newsItem.title}
                    </div>
                <p className={styles.id}>Venue Id: {newsItem.venue} </p>
            </div>

            <div className={styles.bottomWrapper}>
                <div className={styles.cardInfo}>
                        <p className={styles.contentText}>{newsItem.content}</p>
                    <div className={styles.dates}>
                        <p className={styles.date}>
                            <small>Created: {!newsItem.created_at ? "---" : new Date(newsItem.created_at).toLocaleDateString()}</small>
                        </p>
                        {newsItem.end_date && (
                            <p className={styles.date}>
                                <small>Ends: {new Date(newsItem.end_date).toLocaleDateString()}</small>
                            </p>
                        )}

                    </div>
                    {coverImage && <img src={coverImage} alt="Cover" className={styles.coverImage}/>}
                </div>

                <div className={styles.bottom}>
                    {images.length > 0 && <NewsGalleryComponent images={images}/>}
                </div>

            </div>
        </div>
    );
};
