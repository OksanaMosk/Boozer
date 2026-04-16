import React from "react";

type Props = {
    children: React.ReactNode;
}

const ServicesLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default ServicesLayout;
