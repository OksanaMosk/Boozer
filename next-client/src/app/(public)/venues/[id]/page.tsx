import VenuePageClientComponent from "@/components/venue-page-client-component/VenuePageClientComponent";

export default async function VenuePage({ params }: { params: { id: string } }) {
   const resolvedParams = await params;
   const venueId = resolvedParams.id;

    return (
        <div
            style={{
                margin: "0 auto",
                textAlign: "center",
                width: "100vw",
            }}
        >
            <VenuePageClientComponent venueId={venueId}/>
        </div>
    );
}
