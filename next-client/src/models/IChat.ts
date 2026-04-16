export interface IChatRoom {
    id: string;
    name: string;
    interlocutor: {
        id: number;
        username: string;
        avatar?: string;
    };
    last_message?: IMessage;
    unread_count: number;
    updated_at: string;
}

export interface IMessage {
    id?: string;
    room_id: string;
    user_id: number;
    text: string;
    created_at?: string;
    is_read: boolean;
    user: string;
    message: string;
    to?: any;
}