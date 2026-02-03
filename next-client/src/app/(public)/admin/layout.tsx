import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Cars Admin",
};

type Props = {
    children: React.ReactNode;
}

const AdminLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default AdminLayout;
