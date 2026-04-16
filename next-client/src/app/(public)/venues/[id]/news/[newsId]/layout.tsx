import React from "react";

type Props = {
    children: React.ReactNode;
}

const  NewsVenueDetailLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default NewsVenueDetailLayout;