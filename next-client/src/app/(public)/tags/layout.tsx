import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Tags",
};

type Props = {
    children: React.ReactNode;
}

const TagsLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default TagsLayout;