import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Cars forgot",
};

type Props = {
    children: React.ReactNode;
}

const ForgotPasswordLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default ForgotPasswordLayout;