import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Profile",
};

type Props = {
    children: React.ReactNode;
}

const ProfileLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default ProfileLayout;