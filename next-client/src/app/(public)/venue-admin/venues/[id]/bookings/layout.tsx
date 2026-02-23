import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Bookings Venue ID | Boozer",
};

type Props = {
    children: React.ReactNode;
}

const BookingsLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default BookingsLayout;
