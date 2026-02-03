"use client";

import React from 'react';
import RegisterComponent from "@/components/register-component/RegisterComponent";
import {GoBackButtonComponent} from "@/components/go-back-button-component/GoBackButtonComponent";

const RegisterPage = () => {
    return (
        <div>
            <GoBackButtonComponent/>
           <RegisterComponent/>
        </div>
    );
};

export default RegisterPage;