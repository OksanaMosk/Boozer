"use client";

import React from 'react';
import CarCreateComponent from "@/components/venue-create-component/CarCreateComponent";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";

const CreateVenuePage = () => {
    return (
        <div>
            <ButtonGoBackComponent/>
            <CarCreateComponent/>
        </div>
    );
};

export default CreateVenuePage;