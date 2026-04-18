import React from "react";
import type {Metadata} from "next";

export const metadata: Metadata = {
    title: "Menu Items",
};

type Props = {
    children: React.ReactNode;
}

const MenuItemsLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default MenuItemsLayout;
