"use client";

import {Suspense} from "react";

export const dynamic = "force-dynamic";
import ResetPasswordComponent from "@/components/reset-password-component/ResetPasswordComponent";

const ResetPasswordPage = () => {
    return (
        <div>
            <Suspense fallback={<div>Loading...</div>}>
                <ResetPasswordComponent/>
            </Suspense>
        </div>
    );
};

export default ResetPasswordPage;