import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Create Car",
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