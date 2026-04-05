import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Analytics Venue ID | Boozer",
};

type Props = {
    children: React.ReactNode;
}

const AnalyticsLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default AnalyticsLayout;
