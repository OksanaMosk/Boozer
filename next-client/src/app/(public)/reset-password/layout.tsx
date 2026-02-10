import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Reset Password",
};

type Props = {
    children: React.ReactNode;
}

const ResetPasswordLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default ResetPasswordLayout;