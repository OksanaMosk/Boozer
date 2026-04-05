import React from "react";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import {ReviewsManagerComponent} from "@/components/reviews-manager-component/ReviewsManagerComponent";


export default async function ReviewsPage({ params }: { params: Promise<{ id: string }> }) {
  const {id} = await params

    return (
        <div
            style={{
                fontWeight: "bolder",
                margin: "0 auto",
                textAlign: "center"
            }}
        >
            <ButtonGoBackComponent/>
            <ReviewsManagerComponent venueId={id}/>
            <ButtonScrollTopComponent/>
        </div>
    );
}


