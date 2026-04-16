import { ButtonGoBackComponent } from "@/components/button-go-back-component/ButtonGoBackComponent";
import { ButtonScrollTopComponent } from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import {ReviewsGlobalComponent} from "@/components/reviews-global-component/ReviewsGlobalComponent";
import {Metadata} from "next";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    return {
        title: `Reviews Venue ${id} | Boozer`,
        description: `Reviews for Venue #${id} on Boozer.`,
    };
}

export default async function ReviewsPage({params}:Props) {
    const {id} = await params;

    return (
        <div style={{fontWeight: "bolder", margin: "40px auto", textAlign: "center"}}>
            <ButtonGoBackComponent/>
             <ReviewsGlobalComponent venueId={id} />
            <ButtonScrollTopComponent/>
        </div>
  );
}