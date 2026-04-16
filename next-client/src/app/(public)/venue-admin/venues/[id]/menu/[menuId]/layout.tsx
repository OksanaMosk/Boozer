import React from "react";

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
