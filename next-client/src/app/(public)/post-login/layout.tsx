import type {Metadata} from "next";
import React from "react";
import PostLoginPage from "@/app/(public)/post-login/page";

export const metadata: Metadata = {
    title: "PostLogin",
};

type Props = {
    children: React.ReactNode;
}

const PostLoginPageLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default PostLoginPageLayout;