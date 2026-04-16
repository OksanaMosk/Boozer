import React from "react";

type Props = {
    children: React.ReactNode;
}

const ReviewsLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default ReviewsLayout;
