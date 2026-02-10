import VenuesPageClient from "@/components/venues-page-client-component/VenuesPageClient";

export default async function VenuesPage({ params }: { params: { id: string } }) {
   const resolvedParams = await params;
   const carId = resolvedParams.id;

  return (
    <div
      style={{
        margin: "40px auto",
        textAlign: "center",
        width: "100vw",
      }}
    >
      <VenuesPageClient carId={carId} />
    </div>
  );
}
