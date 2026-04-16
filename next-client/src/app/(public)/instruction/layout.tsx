import React from "react";

type Props = {
    children: React.ReactNode;
}

const InstructionPageLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default InstructionPageLayout;