import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "VIP Boozer Create",
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
