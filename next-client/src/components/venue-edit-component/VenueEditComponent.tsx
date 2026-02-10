"use client";

import React, {useEffect, useState, useMemo} from "react";
import {useRouter} from "next/navigation";
import axios from "axios";
import carService from "@/lib/services/carService";
import VenueSelectsComponent from "@/components/venue-selects-component/VenueSelectsComponent";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import {ICar, ICarPhoto} from "@/models/ICar";
import styles from "./VenueEditComponent.module.css";
import {useUser} from "@/app/contexts/UserProvider";

interface CarEditComponentProps {
    carId: string;
}

interface ILocalPhoto {
    file: File;
    preview_url: string;
}

const VenuesEditComponent = ({carId}: CarEditComponentProps) => {
    const router = useRouter();
    const [form, setForm] = useState<Partial<ICar> | null>(null);
    const [exchangeRates, setExchangeRates] = useState<{ USD: number; EUR: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadingPhotos, setLoadingPhotos] = useState(false);
    const [localPhotos, setLocalPhotos] = useState<ICarPhoto[]>([]);
    const [newFiles, setNewFiles] = useState<ILocalPhoto[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const {user} = useUser()

    useEffect(() => {
        if (!carId) return;
        setLoading(true);

        (async () => {
            try {
                const [carResponse, ratesResponse] = await Promise.all([
                    carService.get(carId),
                    carService.getExchangeRates(),
                ]);

                const carsData: ICar = carResponse.data;
                setForm(carsData);
                setLocalPhotos(carsData.photos || []);
                setExchangeRates(ratesResponse.data);
            } catch {
                setError("Failed to load car data");
            } finally {
                setLoading(false);
            }
        })();
    }, [carId]);

    const convertedPrices = useMemo(() => {
        if (!form || !exchangeRates || isNaN(Number(form.price))) {
            return {UAH: 0, USD: 0, EUR: 0};
        }
        const price = Number(form.price);
        const currency = form.currency || "UAH";
        const baseUAH =
            currency === "UAH"
                ? price
                : currency === "USD"
                    ? price * exchangeRates.USD
                    : price * exchangeRates.EUR;

        return {
            UAH: Math.round(baseUAH * 100) / 100,
            USD: Math.round((baseUAH / exchangeRates.USD) * 100) / 100,
            EUR: Math.round((baseUAH / exchangeRates.EUR) * 100) / 100,
        };
    }, [form, exchangeRates]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const {name, value, type, checked} = e.target as HTMLInputElement;
        let newValue: string | number | boolean = value;

        if (type === "checkbox") newValue = checked;
        if (type === "number") newValue = Number(value);

        setForm((prev) => ({...prev!, [name]: newValue}));

        if (name === "brand") {
            setMessage("Please select a model for the brand");
        }
    };

    const validateForm = () => {
        if (!form) return false;
        if (!form.model || form.model.trim() === "") {
            setError("Model is required when brand is selected");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
           if (!user) return;
        if (!form) return;
        if (!validateForm()) return;
        setSaving(true);
        setError(null);

        try {
            const clean = {
                brand: form.brand,
                model: form.model,
                condition: form.condition,
                fuel_type: form.fuel_type,
                location: form.location,
                year: Number(form.year),
                mileage: Number(form.mileage),
                seats_count: Number(form.seats_count),
                max_speed: Number(form.max_speed),
                engine_volume: Number(form.engine_volume),
                has_air_conditioner: Boolean(form.has_air_conditioner),
                description: form.description,
                currency: form.currency,
                price: convertedPrices[form.currency as keyof typeof convertedPrices],
                price_usd: convertedPrices.USD,
                price_eur: convertedPrices.EUR,
            };

            await carService.update(carId, clean, {accessToken:user.token!});
            setMessage("Car updated successfully!");
            router.push("/venue-admin");
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const data = err.response?.data;
                if (data && typeof data === "object" && "detail" in data) {
                    setError(data.detail); // <-- спільне повідомлення від бекенду
                } else if (data && typeof data === "object") {
                    const msg = Object.entries(data)
                        .map(([field, messages]) => `${field}: ${messages}`)
                        .join("\n");
                    setError(msg);
                } else {
                    setError(err.message);
                }
            } else {
                setError("Unexpected error");
            }
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const filesArray = Array.from(e.target.files).slice(
            0,
            5 - localPhotos.length - newFiles.length
        );
        const previews: ILocalPhoto[] = filesArray.map((f) => ({
            file: f,
            preview_url: URL.createObjectURL(f),
        }));
        setNewFiles((prev) => [...prev, ...previews]);
    };

    const handleDeletePhoto = async (id: string) => {
           if (!user) return;
        try {
            await carService.deletePhoto(id, {accessToken:user.token!});
            setLocalPhotos((prev) => prev.filter((p) => p.id !== id));
        } catch {
            setError("Failed to delete photo");
        }
    };

    const handleAddPhotos = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!carId || newFiles.length === 0) return;
   if (!user) return;
        setLoadingPhotos(true);
        try {
            for (const p of newFiles) {
                const formData = new FormData();
                formData.append("photo", p.file);
                formData.append("car", carId);
                await carService.addPhoto(carId, formData, {accessToken:user.token!});
            }
            const updated = await carService.get(carId);
            setLocalPhotos(updated.data.photos);
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
            <div style={{display: "flex", justifyContent: "center", marginTop: 50}}>
                <LoaderComponent/>
            </div>
        );

    return (
        <section className={styles.wrapper}>
            <h3 className={styles.subtitle}>Edit Car #{carId}</h3>
            <form className={styles.form} onSubmit={handleSubmit}>
                <VenueSelectsComponent
                    brand={form.brand ?? ""}
                    model={form.model ?? ""}
                    condition={form.condition ?? ""}
                    fuel_type={form.fuel_type ?? ""}
                    location={form.location ?? ""}
                    setBrand={(brand) => setForm((p) => ({...p!, brand}))}
                    setModel={(model) => setForm((p) => ({...p!, model}))}
                    setCondition={(condition) => setForm((p) => ({...p!, condition}))}
                    setFuelType={(fuel_type) => setForm((p) => ({...p!, fuel_type}))}
                    setLocation={(location) => setForm((p) => ({...p!, location}))}
                />

                <div className={styles.topSection}>
                    <div className={styles.choiceSection}>
                        <div className={styles.inputSection}>
                            <label className={styles.label}>Year*</label>
                            <input
                                name="year"
                                type="number"
                                value={form.year}
                                onChange={handleInputChange}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.inputSection}>
                            <label className={styles.label}>Mileage*</label>
                            <input
                                name="mileage"
                                type="number"
                                value={form.mileage}
                                onChange={handleInputChange}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.inputSection}>
                            <label className={styles.label}>Seats Count*</label>
                            <input
                                name="seats_count"
                                type="number"
                                value={form.seats_count}
                                onChange={handleInputChange}
                                className={styles.input}
                            />
                        </div>
                    </div>
                    <div className={styles.choiceSection}>
                        <div className={styles.inputSection}>
                            <label className={styles.label}>Max Speed*</label>
                            <input
                                name="max_speed"
                                type="number"
                                value={form.max_speed}
                                onChange={handleInputChange}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.inputSection}>
                            <label className={styles.label}>Engine*</label>
                            <input
                                name="engine_volume"
                                type="number"
                                value={form.engine_volume}
                                onChange={handleInputChange}
                                className={styles.input}
                            />
                        </div>
                        <label className={styles.label}>
                            AC
                            <input
                                type="checkbox"
                                name="has_air_conditioner"
                                checked={Boolean(form.has_air_conditioner)}
                                onChange={handleInputChange}
                                className={styles.checkbox}
                            />
                        </label>
                    </div>
                </div>

                <div className={styles.priceSection}>
                    <div className={styles.inputSection}>
                        <label className={styles.label}>Price*</label>
                        <input
                            name="price"
                            type="number"
                            value={form.price}
                            onChange={handleInputChange}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.inputSection}>
                        <label className={styles.label}>Currency*</label>
                        <select
                            name="currency"
                            value={form.currency}
                            onChange={handleInputChange}
                            className={styles.select}
                        >
                            <option value="UAH">UAH</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>
                </div>

                {exchangeRates && (
                    <div className={styles.rate}>
                        1 USD = {exchangeRates.USD} UAH | 1 EUR = {exchangeRates.EUR} UAH
                    </div>
                )}
                <div className={styles.rate}>
                    Price in UAH: {convertedPrices.UAH.toFixed(2)} | USD:{" "}
                    {convertedPrices.USD.toFixed(2)} | EUR: {convertedPrices.EUR.toFixed(2)}
                </div>

                <div className={styles.textareaWrapper}>
                    <label className={styles.label}>Description*</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleInputChange}
                        className={styles.textarea}
                    />
                </div>

                {error && <p className={styles.error}>{error}</p>}
                {message && <p className={styles.success}>{message}</p>}

                <button type="submit" disabled={saving} className={styles.submitButton}>
                    {saving ? (
                        <div className={`authButton ${styles.loaderWrapper}`}>
                            <LoaderComponent/>
                        </div>
                    ) : (
                        "Save Changes"
                    )}
                </button>
            </form>

            {/* Photos */}
            <form onSubmit={handleAddPhotos} className={styles.photoWrapper}>
                <label className={styles.photoLabel}>Upload Photos (Max 5)*</label>
                <input
                    type="file"
                    multiple
                    onChange={handlePhotoChange}
                    disabled={loadingPhotos || localPhotos.length + newFiles.length >= 5}
                    className={styles.input}
                />

                <div className={styles.photoArray}>
                    {localPhotos.map((p) => (
                        <div className={styles.photo} key={p.id}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={p.photo}
                                alt="car photo"
                                width={140}
                                height={100}
                                className={styles.photoImage}
                            />
                            <button
                                type="button"
                                onClick={() => handleDeletePhoto(p.id)}
                                className={styles.deleteButton}
                            >
                                Delete
                            </button>
                        </div>
                    ))}

                    {newFiles.map((file, i) => (
                        <div className={styles.photo} key={i}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={file.preview_url}
                                alt="preview"
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
                    <button type="submit" disabled={loadingPhotos} className={styles.submitButton}>
                        {loadingPhotos ? (
                            <div className={`authButton ${styles.loaderWrapper}`}>
                                <LoaderComponent/>
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

export default VenuesEditComponent;
