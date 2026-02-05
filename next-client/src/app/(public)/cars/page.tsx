'use client';

import React from 'react';
import {CarsClientComponent} from "@/components/cars-client-component/CarsClientComponent";
import {GoBackButtonComponent} from "@/components/go-back-button-component/GoBackButtonComponent";
import HeroVideoRowComponent from "@/components/hero-video-row-component/HeroVideoRowComponent";

const CarsPage = () => {
  return (
    <div>
        <GoBackButtonComponent/>
     <HeroVideoRowComponent/>
    </div>
  );
};

export default CarsPage;


