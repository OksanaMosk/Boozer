"use client";

import React, {Suspense, useEffect, useState} from "react";
import {useSearchParams, useRouter} from "next/navigation";

import HeroComponent from "@/components/hero-component/HeroComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import HeroVideoRowComponent from "@/components/hero-video-row-component/HeroVideoRowComponent";

function HomePageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [message, setMessage] = useState<string | null>(searchParams.get("message"));


    useEffect(() => {
        const msg = searchParams.get("message");
        if (msg) {
            setMessage(msg);
            window.scrollTo({
                top: 0,
                behavior: "auto",
            });
            const timer = setTimeout(() => {
                setMessage(null);
                router.replace("/", {scroll: false});
            }, 7000);

            return () => clearTimeout(timer);
        }
    }, [searchParams, router]);


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
                <p
  style={{
    position: "fixed",
      height: "100px",
    top: 80,
    left: "50%",
    transform: "translateX(-50%)",
    color: "white",
    fontWeight: "bolder",
    zIndex: 1100,
      width: "100vw",
  }}
>{message}</p>
            )}


            <div>
                <HeroComponent/>
                <HeroVideoRowComponent/>
                <ButtonScrollTopComponent/>
            </div>
        </div>
    );
}

export default function HomePage() {
    return (
        <Suspense fallback={<div style={{display: "flex", justifyContent: "center", marginTop: 80}}>
            <LoaderComponent/>
        </div>}>
            <HomePageContent/>
        </Suspense>
    );
}


