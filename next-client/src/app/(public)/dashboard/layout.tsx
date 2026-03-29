import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Dashboard| Boozer",
};

type Props = {
    children: React.ReactNode;
}

const DashboardPageLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default DashboardPageLayout;
