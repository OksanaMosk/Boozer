import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Cars Edit",
};

type Props = {
    children: React.ReactNode;
}

const EditLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default EditLayout;
