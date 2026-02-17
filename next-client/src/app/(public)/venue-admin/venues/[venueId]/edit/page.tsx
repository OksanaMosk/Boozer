import React from "react";
import VenuesEditComponent from "@/components/venue-edit-component/VenueEditComponent";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";

export default async function EditVenuesPage({
                                              params,
                                          }: {
    params: Promise<{ id: string }>;
}) {
    const {id} = await params;
    return (
        <div>
            <ButtonGoBackComponent/>
            <VenuesEditComponent venueId={id}/></div>
    )
}
