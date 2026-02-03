import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Venue Admin ID | Boozer",
};

type Props = {
    children: React.ReactNode;
}

const VenueAdminId = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default VenueAdminId;
