"use client";

import SellerDashboardComponent from "@/components/seller-dashboard-component/SellerDashboardComponent";
import Link from 'next/link';
import {GoBackButtonComponent} from "@/components/go-back-button-component/GoBackButtonComponent";

const SellerPage = () => {

    return (
        <div style={{
            fontWeight: 'bolder',
            margin: '40px auto',
            textAlign: 'center',
            width: '100%'
        }}>
            <GoBackButtonComponent/>
            <Link
                href="/create-car"
                className="create-car-link"
                style={{
                    margin: '40px auto',
                    display: 'inline-block',
                    padding: '10px 20px',
                    backgroundColor: '#003333',
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
            <SellerDashboardComponent/>

        </div>
    );
};

export default SellerPage;

