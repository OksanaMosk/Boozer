import React from "react";

type Props = {
    children: React.ReactNode;
}

const TablesLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default TablesLayout;
