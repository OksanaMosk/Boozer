import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Create Venue",
};

type Props = {
    children: React.ReactNode;
}

const CreateLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default CreateLayout;