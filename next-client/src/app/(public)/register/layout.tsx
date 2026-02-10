import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Register",
};

type Props = {
    children: React.ReactNode;
}

const RegisterLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default RegisterLayout;