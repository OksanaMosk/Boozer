"use client";

import React, {ChangeEvent, SyntheticEvent, useEffect, useState} from "react";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import styles from "./MenuItemFormComponent.module.css"
import venueServices from "@/lib/services/venueService";
import {useUser} from "@/app/contexts/UserProvider";
import {PhotoSingleUploadComponent} from "@/components/photo-single-upload-component/PhotoSingleUploadComponent";

interface NewMenuItem {
    name: string;
    description?: string;
    price: number | string;
    currency: string;
    category: string;
    photo: File | null;
    preview: string | null;
}

interface MenuItem {
    id: string | number;
    name: string;
    description?: string;
    price: number | string;
    currency: string;
    category: string;
    position: number;
    photo?: File | null;
    preview?: string | null;
}

interface MenuItemFormProps {
    venueId: string;
    menuId: string;
    globalCurrency: string;
    onCreate: (item: MenuItem) => void;
}

const CATEGORY_OPTIONS = ["main", "dessert", "drink", "salad", "soup"];

const MenuItemFormComponent: React.FC<MenuItemFormProps> = ({venueId, menuId, globalCurrency, onCreate}) => {
    const {user} = useUser();
    const [menuItem, setMenuItem] = useState<NewMenuItem>({
        name: "",
        description: "",
        price: "",
        currency: globalCurrency,
        category: "main",
        photo: null,
        preview: null,
    });
    const [loadingItem, setLoadingItem] = useState(false);
    const [createdItem, setCreatedItem] = useState<MenuItem | null>(null);
    const [photoUploaded, setPhotoUploaded] = useState(false);

    useEffect(() => {
        if (createdItem) {
            onCreate(createdItem);
        }
    }, [createdItem, onCreate]);


    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setMenuItem({...menuItem, [e.target.name]: e.target.value});
    };

    const handleAddItem = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user?.token) return;
        setLoadingItem(true);

        try {
            const formData = new FormData();
            formData.append("name", menuItem.name);
            formData.append("description", menuItem.description || "");
            formData.append("price", menuItem.price.toString());
            formData.append("currency", globalCurrency);
            formData.append("category", menuItem.category);
            formData.append("menu", menuId);

            const res = await venueServices.venues.menuItems({accessToken: user.token})(venueId)(menuId)
                .create(formData as any);

            const newItem: MenuItem = {
                ...res.data,
                id: String(res.data.id),
                preview: menuItem.preview,
                category: menuItem.category,
                position: 0,
                currency: globalCurrency,
            };
            setCreatedItem(newItem);
            onCreate(newItem);

            setCreatedItem(newItem);
        onCreate(newItem);
        } finally {
            setLoadingItem(false);
        }
    };

    return (
        <form className={styles.wrapper} onSubmit={handleAddItem}>
            <div className={styles.form}>
                <input type="text" name="name" placeholder="Item Name" value={menuItem.name} onChange={handleChange} required className={styles.inputCreate}/>
                <textarea name="description" placeholder="Description" value={menuItem.description}
                          onChange={handleChange} className={styles.textarea}/>
                <input type="number" step="0.01" name="price" placeholder="Price" value={menuItem.price}
                       onChange={handleChange} required className={styles.inputPrice}/>
                <label className={styles.label} htmlFor="category">Category</label>
                <select name="category" value={menuItem.category} onChange={handleChange} className={styles.select}>
                    {CATEGORY_OPTIONS.map(c => <option key={c}
                                                       value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
                {!createdItem || photoUploaded ? (
                    <button type="submit" disabled={loadingItem} className={styles.button}>
                        {loadingItem ? <div className={`authButton ${styles.loaderWrapper}`}><LoaderComponent/>
                        </div> : "Add Menu Item"}
                    </button>
                ) : (
                    <PhotoSingleUploadComponent
                        initialPhotoUrl={createdItem.preview || ""}
                        label="Upload Menu Item Photo"
                        onUpload={async (file: File) => {
                            if (!user?.token || !createdItem) return "";
                            const formData = new FormData();
                            formData.append("photo_menu_item", file);

                            const res = await venueServices.venues.menuItems({accessToken: user.token})(venueId)(menuId)
                                .update(createdItem.id.toString(), formData as any);
                            setCreatedItem(prev => prev ? {...prev, preview: res.data.photo_menu_item} : prev);

                            setPhotoUploaded(true);
                            setMenuItem({
                                name: "",
                                description: "",
                                price: "",
                                currency: globalCurrency,
                                category: "main",
                                photo: null,
                                preview: null,
                            });
                            return res.data.photo_menu_item;
                        }}
                        onChange={(url) => {
                            setCreatedItem(prev => prev ? {...prev, preview: url} : prev);
                        }}
                    />
                )}

            </div>
        </form>
    );
};

export default MenuItemFormComponent;