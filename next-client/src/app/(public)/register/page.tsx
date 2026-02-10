"use client";

import React from 'react';
import RegisterComponent from "@/components/register-component/RegisterComponent";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";

const RegisterPage = () => {
    return (
        <div>
            <ButtonGoBackComponent/>
           <RegisterComponent/>
        </div>
    );
};

export default RegisterPage;