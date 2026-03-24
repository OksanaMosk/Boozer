import React from "react";
import { ButtonGoBackComponent } from "@/components/button-go-back-component/ButtonGoBackComponent";
import { ButtonScrollTopComponent } from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import {ReviewsVisitorComponent} from "@/components/reviews-visitor-component/ReviewsVisitorComponent";

export default async function ReviewsPage({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return (
        <div style={{fontWeight: "bolder", margin: "40px auto", textAlign: "center"}}>
            <ButtonGoBackComponent/>
             <ReviewsVisitorComponent venueId={id} />
            <ButtonScrollTopComponent/>
        </div>
  );
}