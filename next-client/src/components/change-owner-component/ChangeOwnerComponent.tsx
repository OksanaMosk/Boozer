"use client"

import { useEffect, useState } from 'react';
import styles from './ChangeOwnerComponent.module.css';
import venueServices from "@/lib/services/venueService";
import userService from "@/lib/services/userService";
import {useUser} from "@/app/contexts/UserProvider";
import {useRouter} from "next/navigation";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";

interface IProps {
    venueId?: string | number;
}

const ChangeOwnerComponent = ({venueId}:IProps) => {
    const router = useRouter();
    const [venue, setVenue] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | string>('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', isError: false });
    const {user}= useUser()

    useEffect(() => {
    (async () => {
        try {
            if (!venueId || !user?.token) return;
            setLoading(true);
            const [venueRes, usersRes] = await Promise.all([
                venueServices.venues.get(String(venueId), { accessToken: user.token }),
                userService.getAll({ role: 'venue_admin', size: 100 }, { accessToken: user.token })
            ]);

            setVenue(venueRes.data);
            setUsers(usersRes || []);
             console.log("Users Response:", usersRes);
        } catch (error: any) {
            console.error("Data loading error:", error);
            setMessage({
                text: error.response?.status === 404 ? "Venue not found" : "Failed to load data",
                isError: true
            });
        } finally {
            setLoading(false);
        }
    })();
}, [venueId, user?.token]);


    const handleConfirm = async () => {
        if (!selectedUserId) return;
        setLoading(true);
        try {
            if (!user?.token) return;
            await venueServices.venues.changeAdmin(String(venueId), Number(selectedUserId), { accessToken: user.token });
            setMessage({ text: "Owner changed successfully!", isError: false });
            setTimeout(() => router.push('/dashboard?tab=users_control'), 2000);
        } catch (err) {
            setMessage({ text: "Action failed. Check permissions.", isError: true });
        } finally {
            setLoading(false);
        }
    };

    if (!venue) return <div><LoaderComponent/></div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Change Owner for:</h1>
            <h2 className={styles.titleVenue}>{venue.name}</h2>
            <p className={styles.currentAdmin}>
                Current Owner: <strong>{venue.venue_admin_email || venue.venue_admin}</strong>
            </p>

            <div className={styles.selectWrapper}>
                <label className={styles.label}>Select New Owner (Email):</label>
                <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className={styles.select}
                >
                    <option value="">Choose a user</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id}>
                            {u.email} ({u.profile?.name || 'No name'})
                        </option>
                    ))}
                </select>
            </div>

            {message.text && (
                <p className={message.isError ? styles.error : styles.success}>
                    {message.text}
                </p>
            )}

            <div className={styles.buttons}>
                <button
                     onClick={() => router.push('/dashboard?tab=users_control')}
                    className={styles.cancelBtn}
                >
                    Cancel
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={!selectedUserId || loading}
                    className={styles.confirmBtn}
                >
                    {loading ? "Processing..." : "Confirm Change"}
                </button>
            </div>
        </div>
    );
};

export default ChangeOwnerComponent;
