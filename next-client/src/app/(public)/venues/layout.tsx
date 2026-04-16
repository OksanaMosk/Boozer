import React from "react";

type Props = {
    children: React.ReactNode;
}

const VenuesLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default VenuesLayout;
