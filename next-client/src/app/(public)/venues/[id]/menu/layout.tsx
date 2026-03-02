import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Menu Venue ID | Boozer",
};

type Props = {
    children: React.ReactNode;
}

const MenuLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default MenuLayout;
