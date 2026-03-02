import React from "react";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import NewsManagerComponent from "@/components/news-manager-component/NewsManagerComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";


export default async function NewsPage({ params }: { params: Promise<{ id: string }> }) {
  const {id} = await params

    return (
        <div
            style={{
                fontWeight: "bolder",
                margin: "0 auto",
                textAlign: "center"
            }}
        >
            <ButtonGoBackComponent/>
            <NewsManagerComponent venueId={id}/>
            <ButtonScrollTopComponent/>
        </div>
    );
}


