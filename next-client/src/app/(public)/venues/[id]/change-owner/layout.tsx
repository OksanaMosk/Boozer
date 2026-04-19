import React from "react";
import ChangeOwnerPage from "@/app/(public)/venues/[id]/change-owner/page";

type Props = {
    children: React.ReactNode;
}

const ChangeOwnerLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default ChangeOwnerLayout;
