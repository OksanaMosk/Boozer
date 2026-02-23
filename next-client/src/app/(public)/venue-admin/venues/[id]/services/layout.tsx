import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Services Venue ID | Boozer",
};

type Props = {
    children: React.ReactNode;
}

const ServicesLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default ServicesLayout;
