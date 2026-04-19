import VenuePageClientComponent from "@/components/venue-page-client-component/VenuePageClientComponent";
import {Metadata} from "next";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    return {
        title: `Venue ${id} | Boozer`,
        description: `Explore detailed information for Venue #${id} on Boozer.`,
    };
}


export default async function VenuePage({ params }: Props) {
   const resolvedParams = await params;
   const venueId = resolvedParams.id;

    return (
        <div
            style={{
                margin: "0 auto",
                textAlign: "center",
            }}
        >
            <VenuePageClientComponent venueId={venueId}/>
        </div>
    );
}
