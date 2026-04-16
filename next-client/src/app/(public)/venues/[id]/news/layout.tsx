import React from "react";

type Props = {
    children: React.ReactNode;
}

const NewsLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default NewsLayout;
