import React from "react";

type Props = {
    children: React.ReactNode;
}

const EditLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default EditLayout;
