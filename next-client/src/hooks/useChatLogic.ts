import {useState, useEffect, useMemo} from 'react';
import { useUser } from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import {AxiosResponse} from "axios";
import {IChatRoom, IMessage} from "@/models/IChat";
import {useSearchParams} from "next/navigation";

export const useChatLogic = () => {
    const {user} = useUser();
    const [activeRoom, setActiveRoom] = useState<IChatRoom | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [rooms, setRooms] = useState<IChatRoom[]>([]);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const searchParams = useSearchParams();
    const venueIdFromUrl = searchParams.get('venueId');
    const venueNameFromUrl = searchParams.get('venueName');

    useEffect(() => {
        if (!venueIdFromUrl || !user?.id) return;

        const expectedName = `venue_${venueIdFromUrl}_user_${user.id}`;
        const existingRoom = rooms.find(r => r.name === expectedName);

        if (existingRoom) {
            setActiveRoom(existingRoom);
        } else {
            setActiveRoom({
                name: expectedName,
                interlocutor: venueNameFromUrl || `Venue #${venueIdFromUrl}`,
                unread_count: 0,
                messages: []
            } as any);
        }
    }, [venueIdFromUrl, venueNameFromUrl, user?.id, rooms]);


    const fetchRooms = async (showLoading = false) => {
        if (!user?.token) return;
        try {
            if (showLoading) setIsLoading(true);
            const response: AxiosResponse = await venueServices.chat({accessToken: user.token}).getRooms({size: 100});
            setRooms(response.data.data);
        } catch (e) {
            console.error("FetchRooms Error", e);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchRooms(true);
    }, [user?.token]);

    useEffect(() => {
        if (!user?.token) return;

        const interval = setInterval(() => {
            void fetchRooms(false);
        }, 60000);

        return () => clearInterval(interval);
    }, [user?.token]);

    useEffect(() => {
        if (!user?.token || !activeRoom || isLoading) return;

        console.log("WS: Connecting to room:", activeRoom.name);

        if (socket) {
            console.log("WS: Closing previous socket");
            socket.close();
        }

        setMessages([]);
        const newSocket = venueServices.chat({accessToken: user.token}).connect(activeRoom.name);


        newSocket.onopen = () => console.log("WS: Connection Opened ✅");
        newSocket.onerror = (e) => console.error("WS: Connection Error ❌", e);
        newSocket.onclose = () => console.log("WS: Connection Closed 🔒");

        newSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'typing_status') {
                if (String(data.user_id) !== String(user?.id)) {
                    setIsTyping(data.is_typing);
                }
                return;
            }
            if (data.type === 'messages_read') {
                const readerId = data.reader_id;

                if (String(readerId) !== String(user?.id)) {
                    setMessages((prev) => prev.map(msg => ({
                        ...msg,
                        is_read: true
                    })));
                }
                return;
            }
            if (data.message) {
                const senderId = data.user?.split('_')[0]; // Дістаємо ID відправника
                const isFromOther = String(senderId) !== String(user?.id);

                const newMessage = {
                    ...data,
                    is_read: data.is_read !== undefined ? data.is_read : false
                };
                setMessages((prev) => [...prev, newMessage]);

                if (isFromOther && activeRoom && newSocket.readyState === WebSocket.OPEN) {
                    newSocket.send(JSON.stringify({
                        action: "mark_as_read_event",
                        request_id: new Date().getTime().toString(),
                        data: {user_id: user?.id}
                    }));
                }

                setRooms(prevRooms => prevRooms.map(r => {
                    if (r.name === (data.room || activeRoom.name)) {
                        return {
                            ...r,
                            lastMessage: data.message,
                            unread_count: (r.name === activeRoom.name) ? 0 : (Number(r.unread_count || 0) + 1)
                        };
                    }
                    return r;
                }));
            }
        };

        setSocket(newSocket);
        return () => {
            console.log("WS: Cleanup closing socket");
            newSocket.close();
        };
    }, [activeRoom?.name, user?.token, isLoading]);

    const sendMessage = (text: string, venueId: string) => {
        if (!user?.token || !socket || !activeRoom) return;

        if (socket.readyState === WebSocket.OPEN) {
            const cleanId = venueId.includes('_') ? venueId.split('_')[1] : venueId;
            venueServices.chat({accessToken: user.token})
                .pushMessage(
                    socket,
                    Number(cleanId),
                    text,
                    activeRoom.name
                );
        }
    };
    const filteredRooms = useMemo(() => {
        let result = [...rooms];

        if (venueIdFromUrl) {
            const expectedName = `venue_${venueIdFromUrl}_user_${user?.id}`;
            const found = result.find(r => r.name === expectedName);
            if (!found && activeRoom && activeRoom.name === expectedName) {
                result.push(activeRoom);
            }
            return result.filter(room => room.name.startsWith(`venue_${venueIdFromUrl}_`));
        }
        return result;
    }, [rooms, venueIdFromUrl, activeRoom, user?.id]);


    const selectRoom = (room: IChatRoom) => {
        setRooms(prevRooms =>
            prevRooms.map(r =>
                r.name === room.name ? {...r, unread_count: 0} : r
            )
        );
        setActiveRoom(room);
    };
    const sendTypingStatus = (isTypingStatus: boolean) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                action: "typing_event",
                data: {is_typing: isTypingStatus}
            }));
        }
    };

    return {  rooms: filteredRooms,  activeRoom, messages, selectRoom, isTyping, sendTypingStatus, sendMessage, isLoading };
};
