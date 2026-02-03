'use client';

import React from 'react';
import {CarsClientComponent} from "@/components/cars-client-component/CarsClientComponent";
import {GoBackButtonComponent} from "@/components/go-back-button-component/GoBackButtonComponent";
import HeroVideoRow from "@/components/hero-video-row/HeroVideoRow";

const CarsPage = () => {
  return (
    <div>
        <GoBackButtonComponent/>
     <HeroVideoRow/>
    </div>
  );
};

export default CarsPage;


