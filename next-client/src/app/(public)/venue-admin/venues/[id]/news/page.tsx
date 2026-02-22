import React from "react";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";


export default async function NewsPage() {
    return (
        <div
            style={{
                fontWeight: "bolder",
                margin: "40px auto",
                textAlign: "center"
            }}
        >

            <ButtonGoBackComponent/>
        </div>
    );
}


