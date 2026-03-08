import React from "react";
import { ButtonGoBackComponent } from "@/components/button-go-back-component/ButtonGoBackComponent";
import { ButtonScrollTopComponent } from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import MenuVisitorComponent from "@/components/menu-visitor-component/MenuVisitorComponent";
import {ButtonScrollBottomComponent} from "@/components/button-scroll-bottom-component/ButtonScrollBottomComponent";

export default async function MenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div style={{ fontWeight: "bolder", margin: "40px auto", textAlign: "center" }}>
      <ButtonGoBackComponent />
        <ButtonScrollBottomComponent/>
      <MenuVisitorComponent venueId={ id }/>
      <ButtonScrollTopComponent />
    </div>
  );
}