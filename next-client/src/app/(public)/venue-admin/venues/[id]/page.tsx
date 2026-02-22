import React from "react";

import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import VenueAdminDashboardComponent from "@/components/venue-admin-dashboard-component/VenueAdminDashboardComponent";

export default async function VenueIdPage() {
    return (
        <div
            style={{
                fontWeight: "bolder",
                margin: "40px auto",
                textAlign: "center"
            }}
        >
            <VenueAdminDashboardComponent/>
            <ButtonGoBackComponent/>
        </div>
    );
}


