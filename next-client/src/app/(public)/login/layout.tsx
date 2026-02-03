import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Cars Login",
};

type Props = {
    children: React.ReactNode;
}

const LoginLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default LoginLayout;