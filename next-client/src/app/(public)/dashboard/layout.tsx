import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "DashBoard | Boozer",
};

type Props = {
    children: React.ReactNode;
}

const DashBoardLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default DashBoardLayout;
