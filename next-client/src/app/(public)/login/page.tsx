"use client";

import LoginComponent from "@/components/login-component/LoginComponent";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";

const LoginPage = () => {
    return (
        <div style={{
            margin: "0 auto",
            minHeight: "100dvh",
            textAlign: "center",
            boxSizing: "border-box"
        }}>
            <ButtonGoBackComponent/>
            <LoginComponent/>
        </div>
    );
};

export default LoginPage;