import React from "react";

type Props = {
    children: React.ReactNode;
}

const AnalyticsLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default AnalyticsLayout;
