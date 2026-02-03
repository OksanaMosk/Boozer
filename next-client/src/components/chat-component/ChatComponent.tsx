"use client";

import React, {useEffect, useRef, useState, useCallback} from "react";
import {w3cwebsocket as W3CWebSocket, IMessageEvent} from "websocket";
import {socketService} from "@/lib/services/socketService";
import styles from "./ChatComponent.module.css";

type MessageType = {
    userId?: string;
    username?: string;
    user?: string;
    message: string;
};

type IncomingMessage = {
    message: string;
    user?: string;
};

interface ChatComponentProps {
    ownerId: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ownerId}) => {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [targetUser, setTargetUser] = useState<string | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [userId] = useState<string | null>(() => {
        return localStorage.getItem("userId");
    });
    const room = ownerId ? `room_${ownerId}` : null;
    const messageInput = useRef<HTMLTextAreaElement>(null);
    const socketClient = useRef<W3CWebSocket | null>(null);

    const socketInit = useCallback(
        async (roomName: string) => {
            if (!userId) return;
            const {chat} = await socketService();
            const client: W3CWebSocket = chat(`${roomName}`);
            client.onmessage = (message: IMessageEvent) => {
                try {
                    let dataStr: string;

                    if (typeof message.data === "string") dataStr = message.data;
                    else if (message.data instanceof ArrayBuffer)
                        dataStr = new TextDecoder().decode(message.data);
                    else if (Buffer.isBuffer(message.data))
                        dataStr = message.data.toString("utf-8");
                    else return;

                    const data: IncomingMessage = JSON.parse(dataStr);
                    if (!data.message) return;

                    setMessages((prev) => {
                        if (data.user && data.user.includes("_")) {
                            const [id, username] = data.user.split("_");
                            return [...prev, {userId: id, username, message: data.message}];
                        } else {
                            return [...prev, {user: data.user, message: data.message}];
                        }
                    });
                } catch (err) {
                    console.error("Error parsing message:", err);
                }
            };
            socketClient.current = client;
        },
        [userId]
    );

    useEffect(() => {
        if (!room || !chatOpen || !userId) return;
        socketInit(room).catch(err => console.error(err));
        return () => {
            if (
                socketClient.current &&
                socketClient.current.readyState === socketClient.current.OPEN
            ) {
                socketClient.current.close();
            }
        };
    }, [room, chatOpen, userId, socketInit]);


    const handleEnterKey = (event: React.KeyboardEvent) => {
        if (event.key !== "Enter" || !socketClient.current) return;
        const text = (event.target as HTMLInputElement).value.trim();
        if (!text) return;
        const payload = targetUser ? {text: `Private ${text}`, userId: targetUser} : {text};
        socketClient.current.send(
            JSON.stringify({
                data: payload,
                action: targetUser ? "send_private_message" : "send_message",
                request_id: Date.now(),
            })
        );

        (event.target as HTMLInputElement).value = "";
    };

    const handleChatClick = () => {
        if (!userId) {
            window.location.href = "/login";
            return;
        }
        setChatOpen(true);
    };

    if (!chatOpen) {
        return (
            <button className={styles.chatButton} onClick={handleChatClick}>
                Chat
            </button>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.chatBox}>
                <div className={styles.messages}>
                    {messages.map((msg, index) => (
                        <div key={index} className={styles.messageItem}>
              <span
                  onClick={() =>
                      setTargetUser(prev =>
                          prev === msg.userId ? null : msg.userId ?? null
                      )

                  }
                  className={`${styles.username} ${
                      targetUser === msg.userId ? styles.activeUser : ""
                  }`}
              >
                {msg.username || msg.userId || msg.user}:
              </span>
                            <span className={styles.messageText}>{msg.message}</span>
                        </div>
                    ))}
                </div>
                <textarea
                    ref={messageInput}
                    onKeyDown={handleEnterKey}
                    placeholder="Type a message..."
                    className={styles.messageInput}
                />
            </div>
        </div>
    );
};

export default ChatComponent;

