import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Orders Venue ID | Boozer",
};

type Props = {
    children: React.ReactNode;
}

const OrdersLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default OrdersLayout;
