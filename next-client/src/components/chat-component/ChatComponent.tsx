"use client"

import { useUser } from '@/app/contexts/UserProvider';
import styles from './ChatComponent.module.css';
import {ChatSidebarComponent} from "@/components/chat-sidebar-component/ChatSidebarComponent";
import {useChatLogic} from "@/hooks/useChatLogic";
import {ChatWindowComponent} from "@/components/chat-window-component/ChatWindowComponent";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";

export const ChatComponent = () => {
  const { user } = useUser();
  const { rooms, activeRoom, messages, selectRoom, sendMessage, isLoading, sendTypingStatus, isTyping } = useChatLogic();

  if (isLoading) return <LoaderComponent/>;

  return (
    <div className={styles.container}>
      <ChatSidebarComponent
        rooms={rooms || []}
        onRoomSelect={selectRoom}
        activeId={activeRoom?.name}
      />

        <ChatWindowComponent
            room={activeRoom}
            messages={messages || []}
            onSendMessage={sendMessage}
            myId={user?.id}
            sendTypingStatus={sendTypingStatus}
            isTyping={isTyping}
      />
    </div>
  );
};
