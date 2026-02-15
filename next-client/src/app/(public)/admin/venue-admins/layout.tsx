


import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Venue Admins | Boozer",
};

type Props = {
    children: React.ReactNode;
}

const VenueAdminsLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default VenueAdminsLayout;
