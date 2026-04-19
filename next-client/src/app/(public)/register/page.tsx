"use client";

import React from 'react';
import RegisterComponent from "@/components/register-component/RegisterComponent";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";

const RegisterPage = () => {
    return (
         <div style={{
            margin: "40px auto",
            minHeight: "100dvh",
            textAlign: "center",
            boxSizing: "border-box"
        }}>
            <ButtonGoBackComponent/>
           <RegisterComponent/>
        </div>
    );
};

export default RegisterPage;