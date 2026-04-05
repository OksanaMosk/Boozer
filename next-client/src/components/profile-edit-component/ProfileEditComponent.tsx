"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from "@/app/contexts/UserProvider";
import { usePhoneMask } from "@/hooks/usePhoneMask";
import userService from "@/lib/services/userService";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import { PhotoSingleUploadComponent } from "@/components/photo-single-upload-component/PhotoSingleUploadComponent";
import styles from "./ProfileEditComponent.module.css";
import { useSession } from "next-auth/react";

const ProfileEditComponent = () => {
    const { user, setUser } = useUser();
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [phoneServerError, setPhoneServerError] = useState("");
    const [showUpload, setShowUpload] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        phone: "",
        avatar: ""
    });
    const { inputRef: phoneRef, error: phoneError } = usePhoneMask(
        formData.phone,
        (value) => setFormData((prev) => ({ ...prev, phone: value }))
    );
useEffect(() => {
    if (user?.profile && !isInitialized) {
        setFormData({
            name: user.profile.name || "",
            surname: user.profile.surname || "",
            phone: user.profile.phone || "",
            avatar: user.profile.avatar || ""
        });
        setIsInitialized(true);
    }
}, [user?.profile, isInitialized]);
const handleAvatarUpload = async (file: File): Promise<string> => {
    if (!user?.token || !user?.id) return "";
    try {
        setLoading(true);
        const data = new FormData();
        data.append("avatar", file, file.name);
        const response = await userService.updateProfile(String(user.id), data, {
            accessToken: user.token,
        });

       const updatedFields = response.profile || response;
        await update({
            ...session,
            user: { ...session?.user, profile: { ...session?.user?.profile, avatar: updatedFields.avatar } }
        });
        setUser(prev => prev ? { ...prev, profile: { ...prev.profile, avatar: updatedFields.avatar } } : null);
   setFormData(prev => ({ ...prev, avatar: updatedFields.avatar }));
        setShowUpload(false);
        setMessage("Avatar updated!");
        return updatedFields.avatar;
    } catch (err: any) {
        setMessage("Error uploading photo.");
        return "";
    } finally {
        setLoading(false);
    }
};

const handleTextSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!user?.token) return;
    setPhoneServerError("");
    try {
        setLoading(true);
        const data = new FormData();
        data.append("name", formData.name);
        data.append("surname", formData.surname);
        data.append("phone", formData.phone);
        const response = await userService.updateProfile(String(user.id), data, {
            accessToken: user.token,
        });
        const updatedFields = response.profile || response;
        await update({
            ...session,
            user: {
                ...session?.user,
                profile: {
                    ...session?.user?.profile,
                    name: updatedFields.name,
                    surname: updatedFields.surname,
                    phone: updatedFields.phone,
                    avatar: updatedFields.avatar
                }
            }
        });
        setUser(prev => {
            if (!prev) return null;
            return {
                ...prev,
                profile: { ...prev.profile, ...updatedFields }
            };
        });

        setMessage("Profile updated successfully!");
   } catch (err: any) {
        const serverData = err.response?.data || err.data;
        if (serverData?.phone) {
            setPhoneServerError(Array.isArray(serverData.phone) ? serverData.phone[0] : serverData.phone);
        } else {
            setMessage("Error saving data.");
        }
    } finally {
        setLoading(false);
    }
};

    const getAvatarSrc = () => {
        if (!formData.avatar || formData.avatar === "EMPTY") return "";
        if (formData.avatar.startsWith("http")) return formData.avatar;
        const cleanPath = formData.avatar.replace(/^\/?(api\/media\/)?/, "");
        return `http://localhost:8888/api/media/${cleanPath}?t=${Date.now()}`;
    };

    if (!user) return <LoaderComponent />;

    return (
        <div className={styles.header}>
            <h1 className={styles.title}>Edit Profile</h1>
            {message && <p className={styles.status}>{message}</p>}
            <div className={styles.profileMain}>
                <div className={styles.avatarContainer}>
                    <div
                        className={styles.avatarWrapper}
                        onClick={() => setShowUpload(true)}
                    >
                        {formData.avatar && formData.avatar !== "EMPTY" ? (
                            <img src={getAvatarSrc()} alt="Avatar" className={styles.avatarImage} />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                {formData.name?.[0]}{formData.surname?.[0]}
                            </div>
                        )}
                        <div className={styles.overlay}><span>Change</span></div>
                    </div>

                    {showUpload && (
                        <div className={styles.uploadModal}>
                            <PhotoSingleUploadComponent
                                initialPhotoUrl={formData.avatar}
                                onUpload={handleAvatarUpload}
                                onChange={() => {}}
                            />
                            <button className={styles.close} type="button" onClick={() => setShowUpload(false)}>Close</button>
                        </div>
                    )}
                </div>

                <form onSubmit={handleTextSubmit} className={styles.form}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>First name</label>
                        <input
                            className={styles.inputCreate}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Last name</label>
                        <input
                            className={styles.inputCreate}
                            value={formData.surname}
                            onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                        />
                    </div>

                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Phone *</label>
                        <input
                            ref={phoneRef}
                            className={styles.inputCreate}
                            defaultValue={formData.phone}
                        />
                        {phoneError && <p className={styles.errorMessage}>{phoneError}</p>}
                        {(phoneServerError || phoneError) && (
                            <p className={styles.errorMessage}>{phoneServerError || phoneError}</p>
                        )}
                    </div>

                    <button type="submit" disabled={loading} className={styles.saveBtn}>
                        {loading ? "Saving..." : "Save Text Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileEditComponent;