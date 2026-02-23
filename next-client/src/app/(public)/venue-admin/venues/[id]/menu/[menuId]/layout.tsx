import type {Metadata} from "next";
import React from "react";
import MenuItemsPage from "@/app/(public)/venue-admin/venues/[id]/menu/[menuId]/page";

export const metadata: Metadata = {
    title: "Menu Id Venue ID | Boozer",
};

type Props = {
    children: React.ReactNode;
}

const MenuItemsLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default MenuItemsLayout;
