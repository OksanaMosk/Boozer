import React from "react";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import {AnalyticsManagerComponent} from "@/components/analytics-manager-component/AnalyticsManagerComponent";

export default async function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const {id} = await params

    return (
        <div
            style={{
                fontWeight: "bolder",
                margin: "40px auto",
                textAlign: "center"
            }}
        >
            <ButtonGoBackComponent/>
            <AnalyticsManagerComponent venueId={id}/>
            <ButtonScrollTopComponent/>
        </div>
    );
}


