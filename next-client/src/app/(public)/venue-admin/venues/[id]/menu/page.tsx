import React from "react";
import VenueManagementComponent from "@/components/venue-management-component/VenueManagementComponent";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import VenueAdminDashboardComponent from "@/components/venue-admin-dashboard-component/VenueAdminDashboardComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";

export default async function MenuPage() {
    return (
        <div
            style={{
                fontWeight: "bolder",
                margin: "40px auto",
                textAlign: "center"
            }}
        >

            <ButtonGoBackComponent/>
            <ButtonScrollTopComponent/>
        </div>
    );
}


