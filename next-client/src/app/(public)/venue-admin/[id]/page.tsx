import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import VenueManagementComponent from "@/components/venue-management-component/VenueManagementComponent";
import {Metadata} from "next";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    return {
        title: `Venue Admin ${id} | Boozer`,
        description: `Venue management panel for manager ${id}.`,
        robots: {
            index: false,
            follow: false,
        },
    };
}
export default async function Page({params,}: Props) {
  const { id } = await params;
    return (
        <div
            style={{
                fontWeight: "bolder",
                margin: "40px auto",
                textAlign: "center"
            }}
        >
            <ButtonGoBackComponent/>
            <VenueManagementComponent userId={id}/>
        </div>
    );
};


