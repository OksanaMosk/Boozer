import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Instruction | Boozer",
};

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