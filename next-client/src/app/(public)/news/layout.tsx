import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "News | Boozer",
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