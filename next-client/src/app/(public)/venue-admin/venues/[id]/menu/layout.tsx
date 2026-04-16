import React from "react";

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
