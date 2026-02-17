'use client';

import React from 'react';
import {VenuesClientComponent} from "@/components/venues-client-component/VenuesClientComponent";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import HeroVideoRowComponent from "@/components/hero-video-row-component/HeroVideoRowComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";

const VenuesPage = () => {
  return (
    <div style={{
      textAlign: 'center',
    }}>
        <ButtonGoBackComponent/>
        <VenuesClientComponent/>
        <ButtonScrollTopComponent/>
    </div>
  );
};

export default VenuesPage;


