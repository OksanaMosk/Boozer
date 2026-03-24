"use client";

import React from 'react';
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import ProfileEditComponent from "@/components/profile-edit-component/ProfileEditComponent";

const ProfileEditPage = () => {
    return (
        <div>
            <ButtonGoBackComponent/>
           <ProfileEditComponent/>
        </div>
    );
};

export default ProfileEditPage;