import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Profile Edit",
};

type Props = {
    children: React.ReactNode;
}

const ProfileEditLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default ProfileEditLayout;