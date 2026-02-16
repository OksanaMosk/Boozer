import VenuesPageClientComponent from "@/components/venues-page-client-component/VenuesPageClientComponent";

export default async function VenuesPage({ params }: { params: { id: string } }) {
   const resolvedParams = await params;
   const venueId = resolvedParams.id;

  return (
    <div
      style={{
        margin: "40px auto",
        textAlign: "center",
        width: "100vw",
      }}
    >
      <VenuesPageClientComponent venueId={venueId} />
    </div>
  );
}
