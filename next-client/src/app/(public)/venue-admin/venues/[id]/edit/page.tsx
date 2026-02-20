import React from "react";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import VenueEditComponent from "@/components/venue-edit-component/VenueEditComponent";


export default async function EditVenuePage({params,}:{ params: Promise<{ id: string }> }) {
    const {id} = await params;

  return (
    <div>
      <ButtonGoBackComponent />
      <VenueEditComponent venueId={id} />
    </div>
  );
}
