"use client";

import VenueAdminDashboardComponent from "@/components/venue-admin-dashboard-component/VenueAdminDashboardComponent";
import Link from 'next/link';
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";

const VenueAdminIdPage = () => {

    return (
        <div style={{
            fontWeight: 'bolder',
            margin: '40px auto',
            textAlign: 'center',
            width: '100%'
        }}>
            <ButtonGoBackComponent/>

            <VenueAdminDashboardComponent/>

        </div>
    );
};

export default VenueAdminIdPage;

