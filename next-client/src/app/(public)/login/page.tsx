"use client";

import LoginComponent from "@/components/login-component/LoginComponent";
import {GoBackButtonComponent} from "@/components/go-back-button-component/GoBackButtonComponent";

const LoginPage = () => {
    return (
        <div>
            <GoBackButtonComponent/>
            <LoginComponent/>
        </div>
    );
};

export default LoginPage;