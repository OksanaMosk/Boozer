"use client";

import React, { useState, ChangeEvent } from "react";
import styles from "./NewItemForm.module.css";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import { useUser } from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import PhotoMultipleUploadComponent from "@/components/photo-multiple-upload-component/PhotoMultipleUploadComponent";
import {NewsStatus, NewsType} from "@/models/IVenue";
import DatePickerComponent from "@/components/date-picker-component/DatePickerComponent";

interface NewNews {
  title: string;
  content: string;
  type: "general" | "promotion" | "event";
  end_date?: string | null;
  is_pinned: boolean;
  photos: File[];
  preview: string | null;
}

interface News {
  id: string | number;
  venue: string | number;
  title: string;
  content: string;
  type: NewsType;
  status: NewsStatus;
  end_date?: string | null;
  is_pinned: boolean;
  photos?: string[];
  preview?: string | null;
}

interface NewNewsFormProps {
  venueId: string;
  onCreate: (news: News) => void;
}

const NEWS_TYPE_OPTIONS = ["general", "promotion", "event"] as const;

export const NewItemForm: React.FC<NewNewsFormProps> = ({ venueId, onCreate }) => {
  const { user } = useUser();
  const [newsItem, setNewsItem] = useState<NewNews>({
    title: "",
    content: "",
    type: "general",
    end_date: null,
    is_pinned: false,
    photos: [],
    preview: null,
  });
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [createdNews, setCreatedNews] = useState<News | null>(null);
    const [dateValue, setDateValue] = useState<string | null>(newsItem.end_date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);


    const today = new Date();
    const currentYear = today.getFullYear();
    const isValidYear = (year: number) => year >= currentYear

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value, type} = e.target;
        let val: string | boolean = value;
        if (type === "checkbox" && "checked" in e.target) {
            val = e.target.checked;
        }
        setNewsItem(prev => ({ ...prev, [name]: val }));
    };

  const handleAddNews = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.token) return;

    setLoading(true);

    try {
        const formData = new FormData();
        formData.append("title", newsItem.title);
        formData.append("content", newsItem.content);
        formData.append("type", newsItem.type);
        formData.append("is_pinned", newsItem.is_pinned ? "true" : "false");

        if (newsItem.end_date) {
          formData.append("end_date", newsItem.end_date.toISOString());
        }

        const res = await venueServices
            .venues
            .news({ accessToken: user.token })(venueId)
            .create(formData as any);

        const newNews: News = {
            ...res.data,
            id: String(res.data.id),
            venue: Number(venueId),
            title: res.data.title,
            content: res.data.content || "",
            type: res.data.type as NewsType,
            status: res.data.status as NewsStatus,
            is_pinned: res.data.is_pinned ?? false,
            photos: [],
            preview: newsItem.preview,
            end_date: res.data.end_date ?? null,
        };

        setCreatedNews(newNews);
        onCreate(newNews);
    } catch (err) {
        console.error("Create failed:", err);
        alert("Failed to create news");
    } finally {
        setLoading(false);
    }
};

    const handleUploadComplete = (uploadedPhotos: string[]) => {
        if (!createdNews) return;
        setCreatedNews((prev) =>
            prev ? {
                ...prev,
                photos: uploadedPhotos,
            } : null);
        setNewsItem({
            title: "",
            content: "",
            type: "general",
            end_date: null,
            is_pinned: false,
            photos: [],
            preview: null,
        });

            setCreatedNews(null);
    };


    return (
        <form className={styles.wrapper} onSubmit={handleAddNews}>
            <div className={styles.form}>
                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={newsItem.title}
                    onChange={handleChange}
                    required
                    className={styles.inputCreate}
                />
                <textarea
                    name="content"
                    placeholder="Content"
                    value={newsItem.content}
                    onChange={handleChange}
                    className={styles.textarea}
                />
                <label className={styles.label} htmlFor="type">Type</label>
                <select
                    name="type"
                    value={newsItem.type}
                    onChange={handleChange}
                    className={styles.select}
                >
                    {NEWS_TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                </select>
                <span
                    className={`${styles.statusBadge} ${
                        newsItem.type === "general" ? styles.active : styles.pending
                    }`}
                >
                    {newsItem.type === "general" ? "Status: active" :
                        <a className={styles.pending} href="/">Status: pending. Promotion will be published after payment confirmation and admin approval</a>
                    }
                </span>
                <label className={styles.label}>
                    <input
                        type="checkbox"
                        name="is_pinned"
                        checked={newsItem.is_pinned}
                        onChange={handleChange}
                    />
                    Pin News
                </label>

                 <div className={styles.inputGroup}>
                    <div className={styles.calendarWrapper}>
                        <input
                            type="text"
                            placeholder="Add end_date"
                            className={styles.input}
                            value={newsItem.end_date ? new Date(newsItem.end_date).toLocaleDateString("uk-UA") : ""}
                            readOnly
                             onClick={() => setIsCalendarOpen(true)}
                            onKeyDown={(e) => {
                                if (e.key === "Backspace" || e.key === "Delete") {
                                    setNewsItem(prev => ({...prev, end_date: null}));
                                    setDateValue(null);
                                }
                            }}
                        />
                        <div onClick={() => setIsCalendarOpen(!isCalendarOpen)} className={styles.icon}>
                            <img src="/images/calendar.png" alt="calendar icon" width={20} height={20}
                                   className={styles.img}/>
                        </div>

                        {isCalendarOpen && (
                            <div className={styles.calendarSidebar}>
                                <DatePickerComponent
                                    dateValue={dateValue}
                                    setDateValue={(isoDate: string) => {
                                        setDateValue(isoDate);
                                        setNewsItem(prev => ({...prev, end_date: isoDate}));
                                        setIsCalendarOpen(false);
                                    }}
                                    filterDate={(date: Date) => isValidYear(date.getFullYear())}
                                    minDate={tomorrow}
                                    yearRange={[2026, new Date().getFullYear()]}

                                />
                            </div>
                        )}
                    </div>
                </div>
                {createdNews && (
                    <PhotoMultipleUploadComponent
                        venueId={venueId}
                        newsId={createdNews.id.toString()}
                        maxFiles={7}
                        existingPhotos={
                            createdNews.photos?.map((url) => ({
                                preview_url: url,
                                is_cover: false
                            })) || []
                        }
                        onUploadComplete={handleUploadComplete}
                    />
                )}
                <button
                    type="submit"
                    disabled={loading || !!createdNews}
                    className={`${styles.button} ${(loading || !!createdNews) ? styles.buttonDisabled : ''}`}
                >
                    {loading ? (
                        <div className={`authButton ${styles.loaderWrapper}`}><LoaderComponent/></div>
                    ) : "Add News"}
                </button>
            </div>
        </form>
    );
};