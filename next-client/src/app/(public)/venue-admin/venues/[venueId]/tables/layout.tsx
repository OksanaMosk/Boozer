import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Tables Venue ID| Boozer",
};

type Props = {
    children: React.ReactNode;
}

const TablesLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default TablesLayout;
