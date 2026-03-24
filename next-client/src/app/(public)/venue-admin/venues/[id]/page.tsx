import React from "react";

import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import DashboardComponent from "@/components/dashboard-component/DashboardComponent";

export default async function VenueIdPage() {
    return (
        <div
            style={{
                fontWeight: "bolder",
                margin: "40px auto",
                textAlign: "center"
            }}
        >
            <DashboardComponent/>
            <ButtonGoBackComponent/>
        </div>
    );
}


