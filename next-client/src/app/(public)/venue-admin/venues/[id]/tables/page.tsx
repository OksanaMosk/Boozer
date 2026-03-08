import React from "react";

import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import TableMapAdmin from "@/components/table-map-admin-component/TableMapAdmin";

export default async function TablesPage({ params }: { params: Promise<{ id: string }> }) {
  const {id} = await params

    return (
        <div
            style={{
                fontWeight: "bolder",
                margin: "0 auto",
                textAlign: "center"
            }}
        >
            <TableMapAdmin venueId={id}/>
            <ButtonGoBackComponent/>
        </div>
    );
}


