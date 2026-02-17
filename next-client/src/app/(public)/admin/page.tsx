"use client";

import AdminDashboardComponent from "@/components/admin-dashboard-component/AdminDashboardComponent";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import Link from "next/link";


const AdminPage = () => {
  return (
    <div style={{
      fontWeight: 'bolder',
      margin: '40px auto',
      textAlign: 'center',
      width: '100%'
    }}>
      <ButtonGoBackComponent/>
      <AdminDashboardComponent />
         <Link
              href="/venue-admin/create-venue"
              className="create-venue-link"
              style={{
                  margin: '40px auto',
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: 'var(--color-background)',
                  color: 'var(--color-text-muted)',
                  textAlign: 'center',
                  textDecoration: 'none',
                  borderRadius: '15px',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'background-color 0.3s ease',
              }}
          >Create New Venue
          </Link>
    </div>
  );
};

export default AdminPage;