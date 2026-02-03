import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Complete Your Profile",
};

type Props = {
    children: React.ReactNode;
}

const CompleteProfileLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default CompleteProfileLayout;