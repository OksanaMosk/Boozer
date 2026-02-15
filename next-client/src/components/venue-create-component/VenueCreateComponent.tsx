"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import IMask from "imask";

import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import VenueSelectsComponent from "@/components/venue-selects-component/VenueSelectsComponent";
import ThemeVenueMinimalComponent from "@/components/theme-venue-minimal-component/ThemeVenueMinimalComponent";
import ThemeVenuePartyComponent from "@/components/theme-venue-party-component/ThemeVenuePartyComponent";
import MapVenueComponent from "@/components/map-venue-component/MapVenueComponent";

import { IVenue } from "@/models/IVenue";
import { useUser } from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";

import styles from "./VenueCreateComponent.module.css";

interface ILocalPhoto {
  file: File;
  preview_url: string;
}

const VenueCreateComponent = () => {
  const { user } = useUser();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [phone, setPhone] = useState("");
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

  const [localPhotos, setLocalPhotos] = useState<ILocalPhoto[]>([]);
  const [message, setMessage] = useState("");
  const [loadingVenue, setLoadingVenue] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  const [selectedStyle, setSelectedStyle] = useState<
    "minimal" | "eco" | "party" | "classic"
  >("minimal");

  // Маска телефону
  useEffect(() => {
    if (inputRef.current) {
      const maskOptions = { mask: "+{00} (000) 000-00-00" };
      const mask = IMask(inputRef.current, maskOptions);

      mask.on("accept", () => {
        setPhone(mask.value);
      });

      return () => {
        mask.destroy();
      };
    }
  }, []);

  useEffect(() => {
    setNewVenue((prev) => ({ ...prev, phone }));
  }, [phone]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let newValue: any;

    if (type === "checkbox" && "checked" in e.target) {
      newValue = e.target.checked;
    } else if (type === "number") {
      newValue = Number(value);
    } else {
      newValue = value;
    }

    if (name === "phone") {
      setPhone(newValue);
    } else {
      setNewVenue((prev) => ({ ...prev, [name]: newValue }));
    }
  };

  const isValidPhone = (phone: string) => {
    const re = /^\+\d{2} \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    return re.test(phone);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    if (localPhotos.length + files.length > 5) {
      setMessage("You can upload up to 5 photos.");
      return;
    }

    const newPhotos: ILocalPhoto[] = files.map((file) => ({
      file,
      preview_url: URL.createObjectURL(file),
    }));

    setLocalPhotos((prev) => [...prev, ...newPhotos]);
  };

  const handleDeletePhoto = (index: number) => {
    setLocalPhotos((prev) => prev.filter((_, i) => i !== index));
  };




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

    if (phone && !isValidPhone(phone)) {
      setMessage("Phone number must be in format +xx (xxx) xxx-xx-xx");
      return;
    }

      setLoadingVenue(true);
      try {
          if (!user?.token) return setMessage("You must be logged in to create a venue.");

          const venueData = {
              ...newVenue,
              venue_admin: user.id
          };


          const createdVenue = await venueServices.venues.create(venueData, {accessToken: user.token});
          setNewVenue((prev) => ({...prev, id: createdVenue.data.id}));

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
    if (localPhotos.length === 0) return setMessage("Add at least one photo.");

    setLoadingPhotos(true);
    try {
      for (const p of localPhotos) {
        const formData = new FormData();
        formData.append("photo", p.file);
        formData.append("venue", newVenue.id!);

        await venueServices.venuePhotos({ accessToken: user.token }).create(newVenue.id, formData);
      }

      setMessage("Photos uploaded successfully!");
      setLocalPhotos([]);
      router.push(`/venue-admin/venues/${newVenue.id}`);
    } catch {
      setMessage("Error uploading photos.");
    } finally {
      setLoadingPhotos(false);
    }
  };

  const renderPreview = () => {
    switch (selectedStyle) {
      case "minimal":
        return <ThemeVenueMinimalComponent venue={newVenue} photos={localPhotos} />;
      case "party":
        return <ThemeVenuePartyComponent venue={newVenue} photos={localPhotos} />;
      case "eco":
      case "classic":
        return <p>Preview not implemented for {selectedStyle} style</p>;
    }
  };

  return (
    <section className={styles.wrapper}>
      <h3 className={styles.subtitle}>Create New Venue</h3>

      <div className={styles.styleSelector}>
        <label>Select Style: </label>
        <select
          value={selectedStyle}
          onChange={(e) =>
            setSelectedStyle(e.target.value as "minimal" | "eco" | "party" | "classic")
          }
        >
          <option value="minimal">Minimal</option>
          <option value="eco">Eco</option>
          <option value="party">Party</option>
          <option value="classic">Classic</option>
        </select>
      </div>

      <div className={styles.formPreviewWrapper}>
        <form className={styles.form} onSubmit={handleCreateVenue}>
          <VenueSelectsComponent
            country={newVenue.country || ""}
            city={newVenue.city || ""}
            setCountry={(country) => setNewVenue((prev) => ({ ...prev, country }))}
            setCity={(city) => setNewVenue((prev) => ({ ...prev, city }))}
            setCoordinates={(lat, lng) =>
              setNewVenue((prev) => ({ ...prev, latitude: lat, longitude: lng }))
            }
          />

          {newVenue.latitude && newVenue.longitude && !isNaN(newVenue.latitude) ? (
            <div className={styles.mapWrapper}>
              <MapVenueComponent lat={newVenue.latitude} lng={newVenue.longitude} />
            </div>
          ) : (
            <p>Coordinates will appear here after selecting city/country.</p>
          )}

          <div className={styles.textareaWrapper}>
            <div className={styles.inputWrapper}>
              <label className={styles.label}>Venue Name*</label>
              <input
                type="text"
                name="name"
                value={newVenue.name}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.inputWrapper}>
              <label className={styles.label}>Address</label>
              <input
                type="text"
                name="address"
                value={newVenue.address}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <input
                className={styles.input}
                ref={inputRef}
                value={phone}
                onChange={handleInputChange}
                type="tel"
                name="phone"
                placeholder="+xx (xxx) xxx-xx-xx"
              />
            </div>

            <label className={styles.label}>Description*</label>
            <textarea
              name="description"
              value={newVenue.description}
              onChange={handleInputChange}
              required
              className={styles.textarea}
            />
          </div>

          {message && <p className={styles.success}>{message}</p>}

          <button type="submit" disabled={loadingVenue} className={styles.submitButton}>
            {loadingVenue ? <LoaderComponent /> : "Save Venue"}
          </button>
        </form>

        <div className={styles.livePreview}>{renderPreview()}</div>
      </div>

      <form onSubmit={handleAddPhotos} className={styles.photoWrapper}>
        <label className={styles.photoLabel}>Upload Photos (Max 5)*</label>
        <input
          type="file"
          multiple
          onChange={handlePhotoChange}
          disabled={loadingPhotos || localPhotos.length >= 5}
          className={styles.input}
        />

        <div className={styles.photoContainer}>
          {localPhotos.map((photo, i) => (
            <div className={styles.photoArray} key={i}>
              <Image
                className={styles.photoImage}
                src={photo.preview_url}
                alt=""
                width={140}
                height={100}
              />
              <button
                type="button"
                onClick={() => handleDeletePhoto(i)}
                className={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          ))}

          {newVenue.id && localPhotos.length > 0 && (
            <button type="submit" disabled={loadingPhotos} className={styles.submitButton}>
              {loadingPhotos ? <LoaderComponent /> : "Add Photos"}
            </button>
          )}
        </div>
      </form>
    </section>
  );
};

export default VenueCreateComponent;
