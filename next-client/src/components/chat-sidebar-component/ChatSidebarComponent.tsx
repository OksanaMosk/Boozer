"use client"

import styles from './ChatSidebarComponent.module.css';
import {ChatRowComponent} from "@/components/chat-row-component/ChatRowComponent";
import {IChatRoom} from "@/models/IChat";

interface ChatSidebarProps {
  rooms: IChatRoom[];
  onRoomSelect: (room: IChatRoom) => void
  activeId?: string | null;
}

export const ChatSidebarComponent = ({ rooms, onRoomSelect, activeId }: ChatSidebarProps) => {
    return (
    <aside className={styles.sidebar}>
      <div className={styles.list}>
        {rooms && rooms.map((room) => (
          <ChatRowComponent
             key={room.name}
                room={room}
             isActive={room.name === activeId}
            onClick={() => onRoomSelect(room)}
          />
        ))}
           {rooms && rooms.length === 1 && (
                    <div className={styles.placeholderContainer}>
                        <img
                            src="/favicon/android-chrome-512x512.png"
                            alt="Empty space"
                            className={styles.placeholderImage}
                        />
                    </div>
                )}
      </div>
    </aside>
  );
};
