import React from "react";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import {OrdersManagerComponent} from "@/components/orders-manager-component/OrdersManagerComponent";

// export default async function OrdersPage({ params }: { params: Promise<{ id: string }> }) {
//   const {id} = await params
export default async function OrdersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
    return (
        <div
            style={{
                fontWeight: "bolder",
                margin: "0 auto",
                textAlign: "center"
            }}
        >
            <ButtonGoBackComponent/>
            <OrdersManagerComponent venueId={id}/>
            <ButtonScrollTopComponent/>
        </div>
    );
}


