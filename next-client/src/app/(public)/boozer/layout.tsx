import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Create VIP Boozer Order",
};

type Props = {
    children: React.ReactNode;
}

const BoozerLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default BoozerLayout;
