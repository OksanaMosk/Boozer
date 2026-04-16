"use client"

import styles from './ChatRowComponent.module.css';

interface ChatRowProps {
  room: any;
  isActive: boolean;
  onClick: () => void;
}

export const ChatRowComponent = ({room, isActive, onClick}: ChatRowProps) => {
    const displayName = room.interlocutor;
    const unreadCount = room.unread_count || 0;

    return (
        <div
            className={`${styles.row} ${isActive ? styles.active : ''}`}
            onClick={onClick}
        >
            <div className={styles.avatar}>
                {(() => {
                    const rawName = room.interlocutor?.split('(re:')[0].trim();
                    if (!rawName) return "?";
                    const words = rawName.split(/\s+/).filter((w: any) => w.length > 0);
                    if (words.length >= 2) {
                        return (words[0][0] + words[1][0]).toUpperCase();
                    }
                    return rawName.slice(0, 2).toUpperCase();
                })()}
            </div>


            <div className={styles.content}>
                <div className={styles.header}>
                    <span className={styles.name}>{displayName}</span>
                     {unreadCount > 0 && !isActive && (
            <div className={styles.unreadBadge}>
                {unreadCount > 20 ? '20+' : unreadCount}
            </div>
        )}
                </div>
                <div className={styles.messagePreview}>
                    {room.lastMessage || ""}
                </div>

            </div>
        </div>
    );
};