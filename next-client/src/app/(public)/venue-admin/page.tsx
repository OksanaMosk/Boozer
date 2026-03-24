"use client";

import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import DashboardComponent from "@/components/dashboard-component/DashboardComponent";

const VenueAdminPage = () => {

    return (
        <div style={{
            fontWeight: 'bolder',
            margin: '0 auto',
            textAlign: 'center',
            width: '100%'
        }}>
            <ButtonGoBackComponent/>
            <DashboardComponent/>
        </div>
    );
};

export default VenueAdminPage;

