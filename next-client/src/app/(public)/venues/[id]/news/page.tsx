import React from "react";
import { ButtonGoBackComponent } from "@/components/button-go-back-component/ButtonGoBackComponent";
import { ButtonScrollTopComponent } from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import NewsVisitorComponent from "@/components/news-visitor-component/NewsVisitorComponent";
import {Metadata} from "next";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    return {
        title: `News Venue ${id} | Boozer`,
        description: `Explore detailed information for Venue #${id} on Boozer.`,
    };
}


export default async function NewsPage({ params }: Props ) {
  const { id } = await params;

  return (
    <div style={{ fontWeight: "bolder", margin: "40px auto", textAlign: "center" }}>
      <ButtonGoBackComponent />
           <NewsVisitorComponent venueId={ id }/>
      <ButtonScrollTopComponent />
    </div>
  );
}