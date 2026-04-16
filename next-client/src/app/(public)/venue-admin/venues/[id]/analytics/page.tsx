import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import {AnalyticsManagerComponent} from "@/components/analytics-manager-component/AnalyticsManagerComponent";
import {Metadata} from "next";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    return {
        title: `Manage Analytics for Venue ${id} | Boozer`,
        description: `Manage Analytics for Venue ${id} on Boozer.`,
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function AnalyticsPage({ params }: Props) {
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
            <AnalyticsManagerComponent venueId={id}/>
            <ButtonScrollTopComponent/>
        </div>
    );
}


