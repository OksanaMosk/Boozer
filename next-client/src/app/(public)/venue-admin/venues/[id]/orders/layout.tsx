import React from "react";

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
