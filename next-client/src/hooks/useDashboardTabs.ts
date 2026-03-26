"use client";

import {useRouter, useSearchParams} from "next/navigation";

export type TabType =
    | "profile"
    | "favorites"
    | "my_activity"
    | "venues_control"
    | "news"
    | "stats"
    | "users_control";

const VALID_TABS: TabType[] = [
    "profile",
    "favorites",
    "my_activity",
    "venues_control",
    "news",
    "stats",
    "users_control",
];

export const useDashboardTabs = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const paramTab = searchParams.get("tab");

    const activeTab: TabType = VALID_TABS.includes(paramTab as TabType)
        ? (paramTab as TabType)
        : "profile";

    const setTab = (tab: TabType) => {
        const params = new URLSearchParams();
        params.set("tab", tab);

        router.push(`${window.location.pathname}?${params.toString()}`, {
            scroll: false,
        });
    };

    return {activeTab, setTab};
};