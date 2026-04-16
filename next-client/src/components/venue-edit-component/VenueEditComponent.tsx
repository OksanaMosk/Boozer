"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";
import { IVenue, IVenuePhoto } from "@/models/IVenue";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import { VenueFormComponent } from "@/components/venue-form-component/VenueFormComponent";
import { VenuePhotosComponent } from "@/components/venue-photos-component/VenuePhotosComponent";
import styles from "./VenueEditComponent.module.css";

interface Props {
    venueId: string;
}

interface ILocalPhoto {
    file: File;
    preview_url: string;
    is_main?: boolean;
}

const VenueEditComponent = ({ venueId }: Props) => {
    const router = useRouter();
    const [form, setForm] = useState<IVenue | null>(null);
    const [tagsInput, setTagsInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [existingPhotos, setExistingPhotos] = useState<IVenuePhoto[]>([]);
    const [newFiles, setNewFiles] = useState<ILocalPhoto[]>([]);
    const [loadingPhotos, setLoadingPhotos] = useState(false);
    const { user } = useUser();

    useEffect(() => {
        (async () => {
            try {
                if (!venueId || !user?.token) return;
                const response = await venueServices.venues.get(venueId, { accessToken: user.token });
                const venueData = response.data;
                setForm(venueData);
                setExistingPhotos(venueData.photos || []);

                if (venueData.tags && Array.isArray(venueData.tags)) {
                    setTagsInput(venueData.tags.map((t: any) => t.name).join(", "));
                }
            } catch (err) {
                setError("Failed to load venue");
            } finally {
                setLoading(false);
            }
        })();
    }, [venueId, user?.token]);

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!form || !user?.token) return;
        setSaving(true);
        setError(null);
        setMessage(null);

        const tagsArray = tagsInput
            .split(",")
            .map(t => t.trim().toLowerCase())
            .filter(t => t !== "");

        try {
            await venueServices.venues.update(
                venueId,
                {
                    ...form,
                    input_tags: tagsArray
                } as any,
                { accessToken: user.token }
            );

            setMessage("Venue updated successfully!");
            setTimeout(() => router.push("/dashboard"), 1000);
        } catch (err: any) {
            const serverError = err?.response?.data?.description || err?.response?.data?.detail || "Update failed";
            setError(Array.isArray(serverError) ? serverError[0] : serverError);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteExistingPhoto = async (id: string) => {
        if (!user?.token) return;
        try {
            await venueServices.venuePhotos({ accessToken: user.token }).delete(venueId, id);
            setExistingPhotos((prev) => prev.filter((p) => p.id !== id));
        } catch {
            setError("Failed to delete photo");
        }
    };

    const handleAddPhotos = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!user?.token || newFiles.length === 0) return;
        setLoadingPhotos(true);
        try {
            for (const p of newFiles) {
                const formData = new FormData();
                formData.append("photo", p.file);
                formData.append("venue", venueId);
                await venueServices.venuePhotos({ accessToken: user.token }).create(venueId, formData);
            }
            const updated = await venueServices.venues.get(venueId);
            setExistingPhotos(updated.data.photos ?? []);
            setNewFiles([]);
            setMessage("Photos uploaded successfully!");
        } catch {
            setError("Failed to upload photos");
        } finally {
            setLoadingPhotos(false);
        }
    };

    if (loading || !form)
        return (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 70 }}>
                <LoaderComponent />
            </div>
        );

    return (
        <>
            <button type="button"
                     aria-label="go back"
                    className={styles.button}
                    onClick={() => router.push('/dashboard?tab=venues_control')}>Go back
            </button>
            <VenueFormComponent
                mode="edit"
                venueId={venueId}
                form={form}
                setForm={setForm}
                onSubmit={handleSubmit}
                saving={saving}
                error={error}
                message={message}
                tagsInput={tagsInput}
                setTagsInput={setTagsInput}
            />
            <VenuePhotosComponent
                existingPhotos={existingPhotos}
                newFiles={newFiles}
                setNewFiles={setNewFiles}
                onAddPhotos={handleAddPhotos}
                onDeleteExisting={handleDeleteExistingPhoto}
                loading={loadingPhotos}
            />
        </>
    );
};

export default VenueEditComponent;
