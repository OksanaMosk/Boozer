import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Cars Manager",
};

type Props = {
    children: React.ReactNode;
}

const ManagerLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default ManagerLayout;
