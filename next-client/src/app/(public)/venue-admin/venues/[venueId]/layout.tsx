import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Venue ID | Boozer",
};

type Props = {
    children: React.ReactNode;
}

const VenueIdLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default VenueIdLayout;
