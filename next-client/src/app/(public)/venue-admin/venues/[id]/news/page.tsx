import React from "react";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import VenueNewsManagerComponent from "@/components/venue-news-manager-component/VenueNewsManagerComponent";
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
            <VenueNewsManagerComponent venueId={id}/>
            <ButtonScrollTopComponent/>
        </div>
    );
}


