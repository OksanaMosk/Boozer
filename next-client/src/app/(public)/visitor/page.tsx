"use client";

import Link from 'next/link';
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import VisitorDashboardComponent from "@/components/visitor-dashboard-component/VisitorDashboardComponent";

const VisitorPage = () => {

    return (
        <div style={{
            fontWeight: 'bolder',
            margin: '40px auto',
            textAlign: 'center',
            width: '100%'
        }}>
            <ButtonGoBackComponent/>
            <VisitorDashboardComponent/>
            <Link
                href="/create-venue"
                className="create-venue-link"
                style={{
                    margin: '40px auto',
                    display: 'inline-block',
                    padding: '10px 20px',
                    backgroundColor: '#d3b3e0',
                    color: '#fff',
                    textAlign: 'center',
                    textDecoration: 'none',
                    borderRadius: '15px',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'background-color 0.3s ease',
                }}
            >Create New Car
            </Link>

        </div>
    );
};

export default VisitorPage;