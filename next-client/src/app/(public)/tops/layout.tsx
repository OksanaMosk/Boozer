import React from "react";

type Props = {
    children: React.ReactNode;
}

const TopsPageLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default TopsPageLayout;
