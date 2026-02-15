"use client";

import AdminDashboardComponent from "@/components/admin-dashboard-component/AdminDashboardComponent";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import Link from "next/link";


const VenueAdminsPage = () => {
  return (
    <div style={{
      fontWeight: 'bolder',
      margin: '40px auto',
      textAlign: 'center',
      width: '100%'
    }}>
      <ButtonGoBackComponent/>
    </div>
  );
};

export default VenueAdminsPage;