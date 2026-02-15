import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Venue Admin Venues Page",
};

type Props = {
    children: React.ReactNode;
}

const VenueAdminVenuesLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default VenueAdminVenuesLayout;