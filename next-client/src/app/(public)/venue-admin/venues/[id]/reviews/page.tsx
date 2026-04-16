import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import {ReviewsManagerComponent} from "@/components/reviews-manager-component/ReviewsManagerComponent";
import {Metadata} from "next";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    return {
        title: `Manage Reviews for Venue ${id} | Boozer`,
        description: `Manage Reviews for Venue ${id} on Boozer.`,
        robots: {
            index: false,
            follow: false,
        },
    };
}


export default async function ReviewsPage({ params }:Props) {
  const {id} = await params

    return (
        <div
            style={{
                fontWeight: "bolder",
                margin: "40px auto",
                textAlign: "center"
            }}
        >
            <ButtonGoBackComponent/>
            <ReviewsManagerComponent venueId={id}/>
            <ButtonScrollTopComponent/>
        </div>
    );
}


