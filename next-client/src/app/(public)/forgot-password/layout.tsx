import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Forgot Password",
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