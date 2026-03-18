import React from "react";

import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import TableClientWrapperComponent from "@/components/table-client-wrapper/TableClientWrapperComponent";

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
           <TableClientWrapperComponent id={id} />
            <ButtonGoBackComponent/>
        </div>
    );
}


