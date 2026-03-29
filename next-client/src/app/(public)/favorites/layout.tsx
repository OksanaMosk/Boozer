


import type {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Favorites | Boozer",
};

type Props = {
    children: React.ReactNode;
}

const FavoritesPageLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default FavoritesPageLayout;
