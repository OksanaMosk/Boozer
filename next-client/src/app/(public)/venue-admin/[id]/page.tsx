import React from "react";
import CarManagementComponent from "@/components/car-management-component/CarManagementComponent";
import {GoBackButtonComponent} from "@/components/go-back-button-component/GoBackButtonComponent";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
    return (
        <div
            style={{
                fontWeight: "bolder",
                margin: "40px auto",
                textAlign: "center"
            }}
        >
            <CarManagementComponent userId={id}/>
            <GoBackButtonComponent/>
        </div>
    );
}


