import CarsPageClient from "@/components/cars-page-client-component/CarsPageClient";

export default async function CarsPage({ params }: { params: { id: string } }) {
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
      <CarsPageClient carId={carId} />
    </div>
  );
}
