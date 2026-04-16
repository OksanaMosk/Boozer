import React from "react";

type Props = {
    children: React.ReactNode;
}

const TopCreatePageLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default TopCreatePageLayout;
