import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import NewsManagerComponent from "@/components/news-manager-component/NewsManagerComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import {Metadata} from "next";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    return {
        title: `Manage News for Venue ${id} | Boozer`,
        description: `Manage News for Venue ${id} on Boozer.`,
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function NewsPage({ params }:Props) {
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
            <NewsManagerComponent venueId={id}/>
            <ButtonScrollTopComponent/>
        </div>
    );
}


