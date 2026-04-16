
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import {ChatComponent} from "@/components/chat-component/ChatComponent";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Chat | Boozer",
    description: "Chat on Boozer.",
};

const ChatPage = () => {
    return (
         <div style={{margin: "40px auto", textAlign: "center" }}>
             <ButtonGoBackComponent/>
            <ChatComponent/>
             <ButtonScrollTopComponent/>
        </div>
    );
};

export default ChatPage;