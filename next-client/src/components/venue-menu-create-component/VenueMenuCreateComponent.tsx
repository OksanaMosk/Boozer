"use client"

import React, {useState, ChangeEvent, SyntheticEvent} from "react";
import styles from "./VenueMenuCreateComponent.module.css";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import venueServices from "@/lib/services/venueService";
import {useUser} from "@/app/contexts/UserProvider";
import {IMenu} from "@/models/IVenue";

interface VenueMenuCreateComponentProps {
    venueId: string | number;
    onMenuCreated: (menuId: string | number) => void;
}
const VenueMenuCreateComponent: React.FC<VenueMenuCreateComponentProps> = ({ venueId, onMenuCreated }) => {
    const [menu, setMenu] = useState<IMenu>({ venue_id: String(venueId), title: "" });
    const [loadingMenu, setLoadingMenu] = useState(false);
    const { user } = useUser();
    const [message, setMessage] = useState("");

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setMenu(prev => ({ ...prev, [name]: value }));
        setMessage("");
    };

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user?.token) {
            setMessage("User not authenticated.");
            return;
        }

        setLoadingMenu(true);
        try {
            const res = await venueServices.venues.menu({ accessToken: user.token })(String(venueId)).create({ title: menu.title });
            const menuId = res.data.id;
            if (!menuId) {
                setMessage("Menu was not created. Please try again.");
                return;
            }
            setMenu(prev => ({ ...prev, id: menuId }));
            onMenuCreated(menuId);
        } catch (err: any) {
            setMessage(err?.response?.data?.detail || "Error creating menu.");
        } finally {
            setLoadingMenu(false);
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputWrapper}>
                <label className={styles.label}>Menu Title *</label>
                <input
                    type="text"
                    name="title"
                    value={menu.title}
                    onChange={handleChange}
                    className={styles.inputCreate}
                    required
                />
            </div>

            <div className={styles.bottomWrapper}>
                <button type="submit" disabled={loadingMenu} className={styles.submitButton}>
                    {loadingMenu ? <LoaderComponent /> : "Save Menu"}
                </button>
            </div>

            {message && <p className={styles.error}>{message}</p>}
        </form>
    );
};

export default VenueMenuCreateComponent;