"use client";

import React, { useRef, useState, useEffect } from "react";
import styles from "./VenueMenuItemsManagerComponent.module.css";

import VenueMenuItemsCreateComponent
    from "@/components/venue-menu-items-create-component/VenueMenuItemsCreateComponent";

interface Props {
  venue: { id: string; name?: string };
  menu: { id: string };
}

const VenueMenuItemsManagerComponent: React.FC<Props> = ({ venue,menu }) => {
  // const inputRef = useRef<HTMLInputElement>(null);
  // const { user } = useUser();


  return (
        <VenueMenuItemsCreateComponent menuId={menu.id} venueId={venue.id}/>
  );
};

export default VenueMenuItemsManagerComponent;
