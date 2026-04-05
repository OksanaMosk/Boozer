


import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "TOPs | Boozer",
};

type Props = {
    children: React.ReactNode;
}

const TopsPageLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default TopsPageLayout;
