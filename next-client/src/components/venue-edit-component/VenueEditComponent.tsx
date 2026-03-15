"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import { IVenue, IVenuePhoto } from "@/models/IVenue";
import venueServices from "@/lib/services/venueService";
import { useUser } from "@/app/contexts/UserProvider";
import {VenueFormComponent} from "@/components/venue-form-component/VenueFormComponent";
import {VenuePhotosComponent} from "@/components/venue-photos-component/VenuePhotosComponent";

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
    const [existingPhotos, setExistingPhotos] = useState<IVenuePhoto[]>([]);
    const [newFiles, setNewFiles] = useState<ILocalPhoto[]>([]);
    const [loadingPhotos, setLoadingPhotos] = useState(false);
    const {user} = useUser();

    useEffect(() => {
        if (!venueId) return;
        (async () => {
            try {
                const response = await venueServices.venues.get(venueId);
                setForm(response.data);
                setExistingPhotos(response.data.photos || []);
            } catch (err) {
                setError("Failed to load venue");
            } finally {
                setLoading(false);
            }
        })();
    }, [venueId]);

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!form || !user?.token) return;
        setSaving(true);
        setError(null);

        try {
            await venueServices.venues.update(
                venueId,
                form,
                {accessToken: user.token}
            );
            setMessage("Venue updated successfully!");
            router.push(`/venue-admin/venues/${venueId}`);
        } catch (err: any) {
            setError(err?.response?.data?.detail || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteExistingPhoto = async (id: string) => {
        if (!user?.token) return;

        try {
            await venueServices
                .venuePhotos({accessToken: user.token})
                .delete(venueId, id);


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

                await venueServices
                    .venuePhotos({accessToken: user.token})
                    .create(venueId, formData);
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
            <div style={{display: "flex", justifyContent: "center", marginTop: 70}}>
                <LoaderComponent/>
            </div>
        );

    return (
        <>
            <VenueFormComponent
            mode="edit"
            venueId={venueId}
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            saving={saving}
            error={error}
            message={message}
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

