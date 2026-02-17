import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Venue",
};

type Props = {
    children: React.ReactNode;
}

const VenueLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default VenueLayout;
