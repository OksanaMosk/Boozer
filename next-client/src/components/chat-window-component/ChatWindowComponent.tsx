"use client"

import React, { useEffect, useRef, useState } from 'react';
import styles from './ChatWindowComponent.module.css';
import {IChatRoom, IMessage} from "@/models/IChat";

interface ChatWindowProps {
  room?: IChatRoom | null;
  messages: IMessage[] | [];
  onSendMessage: (text: string, venueId: string) => void;
  myId: number | string | undefined;
  sendTypingStatus: (isTyping: boolean) => void;
  isTyping: boolean;
}

export const ChatWindowComponent = ({
                                        room,
                                        messages,
                                        onSendMessage,
                                        myId,
                                        sendTypingStatus,
                                        isTyping
                                    }: ChatWindowProps) => {
    const [inputText, setInputText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({behavior: "smooth"});
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (inputText.trim() && room) {
            onSendMessage(inputText, room.name);
            setInputText('');
        }
    };

    if (!room) {
        return (
            <div className={styles.empty}>
                <p className={styles.typing}>Choose a chat to start messaging.</p>
            </div>
        );
    }
    let venueName = "";
    const raw = String(room?.interlocutor || room?.interlocutor?.username || "Chat");
    const hasRe = raw.includes(' (re: ');
    const parts = raw.split(' (');
    const mainTitle = parts[0];
    if (hasRe) {
        venueName = parts[1]?.replace(')', '');
    }

    let result = "";
    if (parts.length > 1) {
        result = parts[1].replace(')', '');
    }


const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);
    sendTypingStatus(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 1000);
  };

    return (
        <div className={styles.window}>
            <header className={styles.header}>
                <div className={styles.info}>
                    <span className={styles.name}>{mainTitle}
                        {" "}
                        {venueName ? (
                            <span className={styles.venueSubtitle}>{result}</span>) : ("")} {" "}
                        {isTyping && (
                            <span className={styles.typing}>typing......</span>)}
                    </span>
                </div>
            </header>

            <div className={styles.messagesList}>
                {messages.map((msg, index) => {
                    const senderId = msg.user?.split('_')[0];
                    const isOutgoing = String(senderId) === String(myId);
                    return (
                        <div
                            key={index} className={`${styles.message} ${isOutgoing ? styles.outgoing : styles.incoming}`}>
                            {msg.message}
                            {isOutgoing && (<span className={styles.statusIcon}>
                            {msg.is_read ? (<span className={styles.read} title="Read">✔✔</span>) : (<span className={styles.sent} title="Send">✔</span>
                            )}</span>
                            )}
                        </div>
                    );
                })}
                <div ref={scrollRef}/>
            </div>

            <footer className={styles.footer}>
                <input
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Write a message..."
                    className={styles.input}
                />
                <button className={styles.sendBtn} onClick={handleSend}>
                    <svg
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="12" y1="19" x2="12" y2="5"></line>
                        <polyline points="5 12 12 5 19 12"></polyline>
                    </svg>
                </button>
            </footer>
        </div>
  );
};
