'use client';

import React from 'react';
import {VenuesClientComponent} from "@/components/venues-client-component/VenuesClientComponent";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import HeroVideoRowComponent from "@/components/hero-video-row-component/HeroVideoRowComponent";

const VenuesPage = () => {
  return (
    <div>
        <ButtonGoBackComponent/>
        <VenuesClientComponent/>
     <HeroVideoRowComponent/>
    </div>
  );
};

export default VenuesPage;


