import React from "react";
import { ButtonGoBackComponent } from "@/components/button-go-back-component/ButtonGoBackComponent";
import { ButtonScrollTopComponent } from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import NewsVisitorComponent from "@/components/news-visitor-component/NewsVisitorComponent";

export default async function NewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div style={{ fontWeight: "bolder", margin: "40px auto", textAlign: "center" }}>
      <ButtonGoBackComponent />
           <NewsVisitorComponent venueId={ id }/>
      <ButtonScrollTopComponent />
    </div>
  );
}