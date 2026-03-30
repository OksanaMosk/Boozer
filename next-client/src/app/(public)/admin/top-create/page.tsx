import React from 'react';
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import TopManagerComponent from "@/components/top-manager-component/TopManagerComponent";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";

const TopCreatePage = () => {
    return (
        <div>
            <ButtonGoBackComponent/>
            <TopManagerComponent/>
            <ButtonScrollTopComponent/>
        </div>
    );
};

export default TopCreatePage;