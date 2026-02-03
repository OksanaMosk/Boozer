import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Venue Admin | Boozer",
};

type Props = {
    children: React.ReactNode;
}

const VenueAdminLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default VenueAdminLayout;
