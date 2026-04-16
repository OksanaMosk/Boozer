import React from "react";

type Props = {
    children: React.ReactNode;
}

const NewLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default NewLayout;