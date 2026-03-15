import React from "react";
import { ButtonGoBackComponent } from "@/components/button-go-back-component/ButtonGoBackComponent";
import { ButtonScrollTopComponent } from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import MenuVisitorComponent from "@/components/menu-visitor-component/MenuVisitorComponent";

export default async function MenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div style={{ fontWeight: "bolder", margin: "40px auto", textAlign: "center" }}>
      <ButtonGoBackComponent />
           <MenuVisitorComponent venueId={ id }/>
      <ButtonScrollTopComponent />
    </div>
  );
}