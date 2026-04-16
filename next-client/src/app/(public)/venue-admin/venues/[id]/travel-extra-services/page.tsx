import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import TravelLogisticsFormComponent from "@/components/travel-logistics-form-component/TravelLogisticsFormComponent";
import { Metadata } from "next";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    return {
        title: `Manage Travel Services for Venue ${id} | Boozer`,
        description: `Manage travel logistics and extra services for Venue ${id} on Boozer.`,
        robots: {
            index: false,
            follow: false,
        },
    };
}
export default async function TravelExtraServicesPage ({ params }: Props) {
  const { id } = await params;
    return (
        <div
            style={{
                fontWeight: "bolder",
                margin: "40px auto",
                textAlign: "center"
            }}
        >
            <TravelLogisticsFormComponent venueId={id}/>
            <ButtonGoBackComponent/>
        </div>
    );
}


