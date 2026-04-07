import React from "react";
import { ButtonGoBackComponent } from "@/components/button-go-back-component/ButtonGoBackComponent";
import { ButtonScrollTopComponent } from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import {ReviewsGlobalComponent} from "@/components/reviews-global-component/ReviewsGlobalComponent";

export default async function ReviewsPage({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return (
        <div style={{fontWeight: "bolder", margin: "40px auto", textAlign: "center"}}>
            <ButtonGoBackComponent/>
             <ReviewsGlobalComponent venueId={id} />
            <ButtonScrollTopComponent/>
        </div>
  );
}