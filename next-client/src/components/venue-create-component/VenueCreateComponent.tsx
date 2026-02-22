"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {IVenue, ITag} from "@/models/IVenue";
import {useUser} from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import {VenueForm} from "@/components/venue_form_component/VenueFormComponent";
import {VenuePhotosComponent} from "@/components/venue-photos-component/VenuePhotosComponent";
import styles from "@/components/venue_form_component/VenueFormComponent.module.css";

interface ILocalPhoto {
    file: File;
    preview_url: string;
    is_main?: boolean;
}

const VenueCreateComponent = () => {
    const {user} = useUser();
    const router = useRouter();

    const [tagsInput, setTagsInput] = useState("");
    const [newVenue, setNewVenue] = useState<Partial<IVenue>>({
        name: "",
        country: "",
        city: "",
        address: "",
        latitude: 0,
        longitude: 0,
        phone: "",
        description: "",
        opening_hours: {},
        features: {},
        average_check: 0,
        rating: 0,
        reviews_count: 0,
        status: "pending",
        views: 0,
        daily_views: 0,
        weekly_views: 0,
        monthly_views: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_exchange_update: null,
        tags: [],
        photos: [],
    });

    const [message, setMessage] = useState("");
    const [loadingVenue, setLoadingVenue] = useState(false);
    const [loadingPhotos, setLoadingPhotos] = useState(false);
    const [newFiles, setNewFiles] = useState<ILocalPhoto[]>([]);

    const handleCreateVenue = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setMessage("");
        const requiredFields: (keyof IVenue)[] = ["name", "country", "city", "description"];
        for (const field of requiredFields) {
            if (!newVenue[field]) {
                setMessage(`Field "${field}" is required.`);
                return;
            }
        }
        const tagsArray = tagsInput
            .split(",")
            .map(name => ({name: name.trim()}))
            .filter(t => t.name !== "");

        const venueData = {
            ...newVenue,
            venue_admin: user?.id,
            opening_hours: newVenue.opening_hours,
            tags: tagsArray,
        };

        setLoadingVenue(true);

        try {
            if (!user?.token) {
                setMessage("You must be logged in to create a venue.");
                return;
            }

            const createdVenue = await venueServices.venues.create(venueData, {accessToken: user.token});
            const venueId = createdVenue.data.id;
            setNewVenue(prev => ({...prev, id: venueId}));
            const token = user.token;

            if (tagsArray.length) {
                const createdTags = await Promise.all(
                    tagsArray.map(async (tag) => {
                        try {
                            console.log(`Спроба створити тег: "${tag.name}"`);
                            const res = await venueServices.venues.tags(venueId!).create(
                                {name: tag.name},
                                {accessToken: token}
                            );
                            console.log(`Тег створено:`, res.data);
                            return res.data;
                        } catch (err: any) {
                            console.log(`Помилка створення тегу "${tag.name}":`, err);
                            const msg =
                                err.response?.data?.name?.[0] ||
                                err.response?.data?.detail ||
                                err.message || '';

                            if (msg.includes("already exists")) {
                                console.log(`Тег "${tag.name}" вже існує. Пропускаємо створення.`);
                                return {name: tag.name, id: null};
                            }
                            throw err;
                        }
                    })
                );

                console.log("Всі теги підготовлені для прив:", createdTags);
                await Promise.all(
                    createdTags.map(async (tagResp: ITag) => {
                        if (!tagResp.id) {
                            console.log(`Тег "${tagResp.name}" без id, пропускаємо прив'язку`);
                            return;
                        }

                        try {
                            console.log(`Прив'язка тегу "${tagResp.name}" до venue ${venueId}`);
                            await
                                venueServices.venues.venueTags({accessToken: token}).create(
                                venueId!,
                                {
                                    venue_id: venueId,
                                    tag_id: tagResp.id
                                },
                                {accessToken: token}
                            );
                            console.log(`Тег "${tagResp.name}" усп прив`);
                        } catch (err: any) {
                            console.log(`Помилка прив'язки тегу "${tagResp.name}":`, err.response?.data);
                            if (!err.response?.data?.some((e: string) => e.includes("already exists"))) {
                                throw err;
                            }
                        }
                    })
                );
                console.log("Всі теги оброблені.");
            }
            setMessage("Venue created successfully! You can now upload photos.");
        } catch (err: any) {
            setMessage(err?.response?.data?.detail || "Error creating venue.");
        } finally {
            setLoadingVenue(false);
        }
    };

    const handleAddPhotos = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setMessage("");

        if (!user?.token) return;
        if (!newVenue.id) return setMessage("Create the venue first.");
        if (newFiles.length === 0) return setMessage("Add at least one photo.");

        setLoadingPhotos(true);
        try {
            const photosToUpload = newFiles.map((p, i) => ({
                ...p,
                is_main: p.is_main ?? i === 0,
            }));

            for (const p of photosToUpload) {
                const formData = new FormData();
                formData.append("photo", p.file);
                formData.append("venue", newVenue.id!);
                formData.append("is_main", p.is_main ? "true" : "false");
                await venueServices.venuePhotos({accessToken: user.token}).create(newVenue.id, formData);
            }
            setMessage("Photos uploaded successfully!");
            setNewFiles([]);
            router.push(`/venue-admin/venues/${newVenue.id}`);
        } catch {
            setMessage("Error uploading photos.");
        } finally {
            setLoadingPhotos(false);
        }
    };

    return (
        <div className={styles.wrap}>
            <VenueForm
                mode="create"
                form={newVenue}
                setForm={setNewVenue}
                onSubmit={handleCreateVenue}
                saving={loadingVenue}
                message={message}
                tagsInput={tagsInput}
                setTagsInput={setTagsInput}
            />
            <VenuePhotosComponent
                existingPhotos={[]}
                newFiles={newFiles}
                setNewFiles={setNewFiles}
                onAddPhotos={handleAddPhotos}
                loading={loadingPhotos}
            />
        </div>
    );
};

export default VenueCreateComponent;
