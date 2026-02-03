"use client";

import React, {Suspense, useEffect, useState} from "react";
import {useSearchParams, useRouter} from "next/navigation";

import HeroComponent from "@/components/hero-component/HeroComponent";
import {ScrollTopButtonComponent} from "@/components/scroll-top-button-component/ScrollTopButtonComponent";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import HeroVideoRow from "@/components/hero-video-row/HeroVideoRow";

function HomePageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [message, setMessage] = useState<string | null>(searchParams.get("message"));

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null);
                router.replace("/", {scroll: false});
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [message, router]);

    return (
        <div
            style={{
                fontWeight: "bolder",
                margin: "0 auto",
                textAlign: "center",
                width: "100vw",
            }}
        >
            {message && (
                <p style={{color: "#003333", fontWeight: "bolder"}}>{message}</p>
            )}


            <div>
                <HeroComponent/>
                <HeroVideoRow/>
                <ScrollTopButtonComponent/>
            </div>
        </div>
    );
}

export default function HomePage() {
    return (
        <Suspense fallback={<div style={{display: "flex", justifyContent: "center", marginTop: 50}}>
            <LoaderComponent/>
        </div>}>
            <HomePageContent/>
        </Suspense>
    );
}


