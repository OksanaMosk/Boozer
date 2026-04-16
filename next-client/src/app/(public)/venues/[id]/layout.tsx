import React from "react";

type Props = {
    children: React.ReactNode;
}

const VenueLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default VenueLayout;
