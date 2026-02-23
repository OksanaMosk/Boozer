import React from "react";
// import { ButtonGoBackComponent } from "@/components/button-go-back-component/ButtonGoBackComponent";
// import { ButtonScrollTopComponent } from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
// import { IMenuItem} from "@/models/IVenue";
// import venueServices from "@/lib/services/venueService";
import VenueMenuItemsCreateComponent
    from "@/components/venue-menu-items-create-component/VenueMenuItemsCreateComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";


export default async function MenuItemsPage({ params }: { params: { id: string; menuId: string } }) {
  const { id: venueId, menuId } = await params;

  return (
    <div>
        <ButtonScrollTopComponent/>
      <VenueMenuItemsCreateComponent venueId={venueId} menuId={menuId} />
        <ButtonScrollTopComponent/>
    </div>
  );
}