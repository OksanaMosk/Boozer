


import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Top Create | Boozer",
};

type Props = {
    children: React.ReactNode;
}

const TopCreatePageLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default TopCreatePageLayout;
