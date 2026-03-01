"use client";

import React from "react";
import VenueMenuItemsCreateComponent
    from "@/components/venue-menu-items-create-component/VenueMenuItemsCreateComponent";

interface Props {
  venue: { id: string; name?: string };
  menu: { id: string };
}

const VenueMenuItemsManagerComponent: React.FC<Props> = ({ venue,menu }) => {
  return (
        <VenueMenuItemsCreateComponent menuId={menu.id} venueId={venue.id}/>
  );
};

export default VenueMenuItemsManagerComponent;
