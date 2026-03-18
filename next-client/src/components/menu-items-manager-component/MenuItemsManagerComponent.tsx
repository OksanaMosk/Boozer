"use client";

import React from "react";
import MenuItemsCreateComponent
    from "@/components/menu-items-create-component/MenuItemsCreateComponent";

interface Props {
    venue: { id: string; name?: string };
    menu: { id: string };
}

const MenuItemsManagerComponent: React.FC<Props> = ({venue, menu}) => {
    return (
        <MenuItemsCreateComponent menuId={menu.id} venueId={venue.id}/>
    );
};

export default MenuItemsManagerComponent;
