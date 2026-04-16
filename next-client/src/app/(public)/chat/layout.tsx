import React from "react";

type Props = {
    children: React.ReactNode;
}

const ChatLayout = ({children}: Props) => {
    return (
        <>
            {children}
        </>
    );
}
export default ChatLayout;