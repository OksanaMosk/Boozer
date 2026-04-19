"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import { IVenue } from "@/models/IVenue";
import { VenuePhotosComponent } from "@/components/venue-photos-component/VenuePhotosComponent";
import { VenueFormComponent } from "@/components/venue-form-component/VenueFormComponent";
import styles from "./VenueCreateComponent.module.css";

interface ILocalPhoto {
    file: File;
    preview_url: string;
    is_main?: boolean;
}

const VenueCreateComponent = () => {
    const { user } = useUser();
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
            .map(t => t.trim().toLowerCase())
            .filter(t => t !== "");

        const venueData = {
            ...newVenue,
            venue_admin: user?.id,
            input_tags: tagsArray,
        };
        setLoadingVenue(true);
        try {
            if (!user?.token) {
                setMessage("You must be logged in to create a venue.");
                return;
            }
            const createdVenue = await venueServices.venues.create(venueData, { accessToken: user.token });
            const venueId = createdVenue.data.id;
            setNewVenue(prev => ({ ...prev, id: venueId }));

            setMessage("Venue created successfully! Now you can upload photos.");
        } catch (err: any) {
            const errorData = err?.response?.data;
            if (errorData && typeof errorData === 'object' && !Array.isArray(errorData)) {
                const fieldName = Object.keys(errorData)[0];
                const fieldError = errorData[fieldName];
                const capitalizedField = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
                const errorMessage = Array.isArray(fieldError) ? fieldError[0] : fieldError;
                setMessage(`${capitalizedField}: ${errorMessage}`);
            } else {
                setMessage(err?.response?.data?.detail || "Error creating venue.");
            }
        } finally {
            setLoadingVenue(false);
        }
    };

    const handleAddPhotos = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setMessage("");

        if (!user?.token || !newVenue.id) return setMessage("Create the venue first.");
        if (newFiles.length === 0) return setMessage("Add at least one photo.");

        setLoadingPhotos(true);
        try {
            for (const [index, p] of newFiles.entries()) {
                const formData = new FormData();
                formData.append("photo", p.file);
                formData.append("venue", String(newVenue.id));
                formData.append("is_main", (p.is_main ?? index === 0) ? "true" : "false");

                await venueServices.venuePhotos({ accessToken: user.token }).create(newVenue.id, formData);
            }

            setMessage("Photos uploaded successfully!");
            router.push("/dashboard?tab=venues_control");
        } catch (err) {
            setMessage("Error uploading photos.");
        } finally {
            setLoadingPhotos(false);
        }
    };

    return (
        <div className={styles.wrap}>
            <VenueFormComponent
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
