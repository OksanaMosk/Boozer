"use client";

import React, {ChangeEvent, SyntheticEvent, useEffect, useState} from "react";
import {useUser} from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import {PhotoSingleUploadComponent} from "@/components/photo-single-upload-component/PhotoSingleUploadComponent";
import styles from "./MenuItemFormComponent.module.css"

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

const CATEGORY_OPTIONS = ["mains", "desserts", "drinks", "salads", "soups"];

const MenuItemFormComponent: React.FC<MenuItemFormProps> = ({venueId, menuId, globalCurrency, onCreate}) => {
    const {user} = useUser();
    const [loadingItem, setLoadingItem] = useState(false);
    const [createdItem, setCreatedItem] = useState<MenuItem | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [photoUploaded, setPhotoUploaded] = useState(false);
    const [menuItem, setMenuItem] = useState<NewMenuItem>({
        name: "",
        description: "",
        price: "",
        currency: globalCurrency,
        category: "mains",
        photo: null,
        preview: null,
    });

    useEffect(() => {
        setMenuItem(prev => ({
            ...prev,
            currency: globalCurrency
        }));
    }, [globalCurrency]);


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
        setErrorMsg(null);

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
            setPhotoUploaded(false);
            setCreatedItem(newItem);
            onCreate(newItem);
        } catch (error: any) {
            const serverErrors = error?.response?.data;

            if (serverErrors && serverErrors.price) {
                const message = Array.isArray(serverErrors.price)
                    ? serverErrors.price[0]
                    : serverErrors.price;

                setErrorMsg(message);
            } else {
                setErrorMsg("Failed to add item. Please check the data.");
            }
        } finally {
            setLoadingItem(false);
        }
    };

    return (
        <form className={styles.wrapper} onSubmit={handleAddItem}>
            <div className={styles.form}>
                <input type="text" name="name" placeholder="Item Name" value={menuItem.name} onChange={handleChange}
                       required className={styles.inputCreate}/>
                <textarea name="description" placeholder="Description" value={menuItem.description}
                          onChange={handleChange} className={styles.textarea}/>
                <div className={styles.priceInputWrapper}>
                    <input type="number" step="0.01" min="0" onKeyDown={(e) => {
                        if (e.key === '-') e.preventDefault();
                    }} name="price" placeholder="Price" value={menuItem.price}
                           onChange={handleChange} required className={styles.inputPrice}/>
                    <span className={styles.currencyLabel}>{globalCurrency}</span>
                    {errorMsg && <p className={styles.errorMessage}>{errorMsg}</p>}
                </div>
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
                        key={createdItem.id}
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
                                category: "mains",
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