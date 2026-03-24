"use client";

import Link from 'next/link';
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import VisitorDashboardComponent from "@/components/visitor-dashboard-component/VisitorDashboardComponent";
import DashboardComponent from "@/components/dashboard-component/DashboardComponent";

const VisitorPage = () => {

    return (
        <div style={{
            fontWeight: 'bolder',
            margin: '40px auto',
            textAlign: 'center',
            width: '100%'
        }}>
            <ButtonGoBackComponent/>
           <DashboardComponent/>
        </div>
    );
};

export default VisitorPage;