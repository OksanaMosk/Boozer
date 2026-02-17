"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import VenueSelectsComponent from "@/components/venue-selects-component/VenueSelectsComponent";
import { OpeningHoursFormComponent } from "@/components/opening-hours-form-component/OpeningHoursFormComponent";
import { IVenue, IVenuePhoto } from "@/models/IVenue";
import venueServices from "@/lib/services/venueService";
import { useUser } from "@/app/contexts/UserProvider";
import styles from "./VenueCreateComponent.module.css";

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
  const { user } = useUser();
  // const [form, setForm] = useState<Partial<IVenue> | null>(null);
  const [form, setForm] = useState<IVenue | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingPhotos, setExistingPhotos] = useState<IVenuePhoto[]>([]);
  const [newFiles, setNewFiles] = useState<ILocalPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  useEffect(() => {
    if (!venueId) return;

    (async () => {
      try {
        const response = await venueServices.venues.get(venueId);
        const venue: IVenue = response.data;
        setForm(venue);
        setExistingPhotos(venue.photos || []);

      } catch {
        setError("Failed to load venue");
      } finally {
        setLoading(false);
      }
    })();
  }, [venueId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    // setForm((prev) => ({ ...prev!, [name]: value }));
    setForm(prev => prev ? { ...prev, [name]: value } : prev);

  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!form || !user?.token) return;

    setSaving(true);
    setError(null);

    try {
      await venueServices.venues.update(
        venueId,
        form,
        { accessToken: user.token }
      );

      setMessage("Venue updated successfully!");
      router.push(`/venue-admin/venues/${venueId}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const previews = files.map((f) => ({
      file: f,
      preview_url: URL.createObjectURL(f),
    }));

    setNewFiles((prev) => [...prev, ...previews]);
  };

  const handleDeleteExistingPhoto = async (id: string) => {
    if (!user?.token) return;

    try {
      await venueServices
  .venuePhotos({ accessToken: user.token })
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
          .venuePhotos({ accessToken: user.token })
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
      <div style={{ display: "flex", justifyContent: "center", marginTop: 70 }}>
        <LoaderComponent />
      </div>
    );

  return (
    <section className={styles.wrapper}>
      <h3 className={styles.subtitle}>Edit Venue #{venueId}</h3>

      <div className={styles.formWrapper}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.coordinatesWrapper}>
            <div className={styles.leftSideWrapper}>
              <VenueSelectsComponent
                country={form.country || ""}
                city={form.city || ""}
                setCountry={(country) =>
                  setForm((prev) => ({ ...prev!, country }))
                }
                setCity={(city) =>
                  setForm((prev) => ({ ...prev!, city }))
                }
                setCoordinates={(lat, lng) =>
                  setForm((prev) => ({
                    ...prev!,
                    latitude: lat,
                    longitude: lng,
                  }))
                }
              />

              <div className={styles.inputWrapper}>
                <label className={styles.label}>Venue Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  className={styles.inputCreate}
                />
              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.label}>Address *</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleInputChange}
                  className={styles.inputCreate}
                />
              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.label}>Phone</label>
                <input
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    className={styles.inputCreate}
                />
              </div>
                {form && (
                    <OpeningHoursFormComponent
                        newVenue={form}
                        setNewVenue={setForm}
                    />
                )}
            </div>
          </div>

          <div className={styles.bottomWrapper}>
            <div className={styles.inputWrapper}>
              <label className={styles.label}>Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                className={styles.textarea}
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}
            {message && <p className={styles.success}>{message}</p>}

            <button
              type="submit"
              disabled={saving}
              className={styles.submitButton}
            >
              {saving ? (
                <div className={`authButton ${styles.loaderWrapper}`}>
                  <LoaderComponent />
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Photos */}

      <form onSubmit={handleAddPhotos} className={styles.photoWrapper}>
        <label className={styles.label}>Upload Photos</label>
        <input
          type="file"
          multiple
          onChange={handlePhotoChange}
          disabled={loadingPhotos}
          className={styles.inputFile}
        />

        <div className={styles.photoContainer}>
          {existingPhotos.map((p) => (
            <div className={styles.photoArray} key={p.id}>
              <Image
                src={p.photo}
                alt=""
                width={140}
                height={100}
                className={styles.photoImage}
              />
              <button
                type="button"
                onClick={() => handleDeleteExistingPhoto(p.id)}
                className={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          ))}

          {newFiles.map((file, i) => (
            <div className={styles.photoArray} key={i}>
              <Image
                src={file.preview_url}
                alt=""
                width={140}
                height={100}
                className={styles.photoImage}
              />
              <button
                type="button"
                onClick={() =>
                  setNewFiles((prev) => prev.filter((_, idx) => idx !== i))
                }
                className={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {newFiles.length > 0 && (
          <button
            type="submit"
            disabled={loadingPhotos}
            className={styles.submitButton}
          >
            {loadingPhotos ? (
              <div className={`authButton ${styles.loaderWrapper}`}>
                <LoaderComponent />
              </div>
            ) : (
              "Add Photos"
            )}
          </button>
        )}
      </form>
    </section>
  );
};

export default VenueEditComponent;

