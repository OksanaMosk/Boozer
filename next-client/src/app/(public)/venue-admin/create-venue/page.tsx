"use client";

import React from 'react';
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import VenueCreateComponent from "@/components/venue-create-component/VenueCreateComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";

const CreateVenuePage = () => {
    return (
         <div style={{
            margin: '80px auto',
        }}>
            <ButtonGoBackComponent/>
            <VenueCreateComponent/>
             <ButtonScrollTopComponent/>
        </div>
    );
};

export default CreateVenuePage;