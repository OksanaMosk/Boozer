import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "News Venue ID| Boozer",
};

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
