'use client';

import React from 'react';
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import {BoozerVenuesClientComponent} from "@/components/boozer-venues-client-component/BoozerVenuesClientComponent.";

const BoozerPage = () => {
  return (
    <div style={{
      textAlign: 'center',
    }}>
        <ButtonGoBackComponent/>
        <BoozerVenuesClientComponent/>
        <ButtonScrollTopComponent/>
    </div>
  );
};

export default BoozerPage;


