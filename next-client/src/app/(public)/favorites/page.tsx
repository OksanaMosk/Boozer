"use client"
import React from 'react';
import { ButtonGoBackComponent } from "@/components/button-go-back-component/ButtonGoBackComponent";
import { ButtonScrollTopComponent } from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import { FavoriteManagerComponent } from "@/components/favorite-manager-component/FavoriteManagerComponent";
import { useUser } from "@/app/contexts/UserProvider"; // Імпортуємо ваш контекст
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";

const FavoritesPage = () => {
    const { user, loading } = useUser();
    if (loading) return <LoaderComponent />;

    if (!user) return <div style={{ marginTop: '100px', textAlign: 'center' }}>Please Sign In to see your favorites.</div>;

    return (
        <div style={{
            margin: '80px auto'
        }}>
            <ButtonGoBackComponent />

            <h1 style={{ marginBottom: '20px' }}>
                {user.role === 'admin' ? "Manage Official TOPs" : "My Favorite Lists"}
            </h1>
            <FavoriteManagerComponent
                role={user.role}
                userId={String(user.id)}
                token={user.token || ""}
            />

            <ButtonScrollTopComponent />
        </div>
    )
}

export default FavoritesPage;