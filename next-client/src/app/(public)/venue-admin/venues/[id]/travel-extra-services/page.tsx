import React from "react";

import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import TravelLogisticsFormComponent from "@/components/travel-logistics-form-component/TravelLogisticsFormComponent";

export default async function TravelExtraServicesPage ({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
    return (
        <div
            style={{
                fontWeight: "bolder",
                margin: "40px auto",
                textAlign: "center"
            }}
        >
            <TravelLogisticsFormComponent venueId={id}/>
            <ButtonGoBackComponent/>
        </div>
    );
}


