"use client";

import LoginComponent from "@/components/login-component/LoginComponent";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";

const LoginPage = () => {
    return (
        <div>
            <ButtonGoBackComponent/>
            <LoginComponent/>
        </div>
    );
};

export default LoginPage;