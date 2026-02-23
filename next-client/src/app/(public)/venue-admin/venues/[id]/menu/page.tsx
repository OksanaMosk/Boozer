import React from "react";
import { ButtonGoBackComponent } from "@/components/button-go-back-component/ButtonGoBackComponent";
import { ButtonScrollTopComponent } from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import VenueMenuManagerComponent from "@/components/venue-menu-manager-component/VenueMenuManagerComponent";
import { IMenu } from "@/models/IVenue";
import venueServices from "@/lib/services/venueService";


export default async function MenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const response = await venueServices.venues.menu()(id).getAll();

  const menus: IMenu[] = response.data.data;
  console.log("menus:", menus);

  return (
    <div
      style={{
        fontWeight: "bolder",
        margin: "40px auto",
        textAlign: "center"
      }}
    >
      <ButtonGoBackComponent />

      <VenueMenuManagerComponent
        venue={{ id }}
        menus={menus}
      />

      <ButtonScrollTopComponent />
    </div>
  );
}