import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Visitor | Boozer",
};

type Props = {
    children: React.ReactNode;
}

const VisitorPageLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default VisitorPageLayout;
