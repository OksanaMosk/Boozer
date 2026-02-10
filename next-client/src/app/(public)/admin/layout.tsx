


import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Admin | Boozer",
};

type Props = {
    children: React.ReactNode;
}

const AdminPageLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default AdminPageLayout;
