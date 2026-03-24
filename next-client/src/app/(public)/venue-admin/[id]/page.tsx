

import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import VenueManagementComponent from "@/components/venue-management-component/VenueManagementComponent";

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
            <ButtonGoBackComponent/>
            <VenueManagementComponent userId={id}/>
        </div>
    );
};


