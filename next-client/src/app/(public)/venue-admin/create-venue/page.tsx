"use client";

import React from 'react';
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import VenueCreateComponent from "@/components/venue-create-component/VenueCreateComponent";

const CreateVenuePage = () => {
    return (
         <div style={{
            margin: '80px auto',
        }}>
            <ButtonGoBackComponent/>
            <VenueCreateComponent/>
        </div>
    );
};

export default CreateVenuePage;