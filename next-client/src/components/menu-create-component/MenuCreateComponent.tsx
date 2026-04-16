"use client"

import React, {useState, ChangeEvent, SyntheticEvent} from "react";
import {useUser} from "@/app/contexts/UserProvider";
import {IMenu} from "@/models/IVenue";
import venueServices from "@/lib/services/venueService";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import styles from "./MenuCreateComponent.module.css";

interface VenueMenuCreateComponentProps {
    venueId: string | number;
    onMenuCreated: (menu: IMenu) => void;

}

const MenuCreateComponent: React.FC<VenueMenuCreateComponentProps> = ({venueId, onMenuCreated}) => {
    const [menu, setMenu] = useState<IMenu>({venue_id: String(venueId), title: ""});
    const [loadingMenu, setLoadingMenu] = useState(false);
    const {user} = useUser();
    const [message, setMessage] = useState("");

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setMenu(prev => ({...prev, [name]: value}));
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
            const res = await venueServices.venues.menu({accessToken: user.token})(String(venueId)).create({title: menu.title});
            const menuId = res.data.id;
            if (!menuId) {
                setMessage("Menu was not created. Please try again.");
                return;
            }
            setMenu(prev => ({...prev, id: menuId}));
            const newMenu = {...menu, id: menuId};
            onMenuCreated(newMenu);
            setMenu({venue_id: String(venueId), title: ""});
        } catch (err: any) {
            setMessage(err?.response?.data?.detail || "Error creating menu.");
        } finally {
            setLoadingMenu(false);
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            {message && <p className={styles.error}>{message}</p>}
            <div className={styles.inputWrapper}>
                <h5 className={styles.subtitle}>
                    Add new Menu
                </h5>
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
                <button
                    type="submit"
                    disabled={loadingMenu}
                    className={styles.submitButton}
                    aria-label={loadingMenu ? "Saving menu changes" : "Save menu"}
                >
                    {loadingMenu ? <div className={styles.loaderWrapper}><LoaderComponent/></div> : "Save Menu"}
                </button>
            </div>
        </form>
    );
};

export default MenuCreateComponent;