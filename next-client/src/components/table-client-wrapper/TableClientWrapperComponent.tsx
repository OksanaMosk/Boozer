"use client";

import dynamic from "next/dynamic";

const TableMapAdmin = dynamic(
  () => import("@/components/table-map-admin-component/TableMapAdmin"),
  { ssr: false, loading: () => <div>Loading...</div> }
);

export default function TableClientWrapperComponent({ id }: { id: string }) {
  return <TableMapAdmin venueId={id} />;
}