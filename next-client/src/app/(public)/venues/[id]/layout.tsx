import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Venues",
};

type Props = {
    children: React.ReactNode;
}

const VenuesLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default VenuesLayout;
