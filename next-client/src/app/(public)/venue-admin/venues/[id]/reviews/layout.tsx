import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Reviews Venue ID | Boozer",
};

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
