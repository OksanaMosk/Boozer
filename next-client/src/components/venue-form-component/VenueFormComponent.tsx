"use client"

import React from "react";
import {usePhoneMask} from "@/hooks/usePhoneMask";
import VenueSelectsComponent from "@/components/venue-selects-component/VenueSelectsComponent";
import {OpeningHoursFormComponent} from "@/components/opening-hours-form-component/OpeningHoursFormComponent";
import MapVenueComponent from "@/components/map-venue-component/MapVenueComponent";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import styles from "./VenueFormComponent.module.css"

type VenueFormMode = "create" | "edit";

interface VenueFormProps {
    mode: VenueFormMode;
    venueId?: string;
    form: any;
    setForm: React.Dispatch<React.SetStateAction<any>>;
    onSubmit: (e: React.SyntheticEvent) => void;
    saving: boolean;
    error?: string | null;
    message?: string | null;
    tagsInput?: string;
    setTagsInput?: React.Dispatch<React.SetStateAction<string>>;
}

const CURRENCY_OPTIONS = ["UAH", "USD", "EUR"];
export const VenueFormComponent = ({
                                       mode,
                                       venueId,
                                       form,
                                       setForm,
                                       onSubmit,
                                       saving,
                                       error,
                                       message,
                                       tagsInput,
                                       setTagsInput,
                                   }: VenueFormProps) => {
    const isCreate = mode === "create";

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const {name, value} = e.target;
        setForm((prev: any) => ({...prev, [name]: value}));
    };

    const {inputRef: phoneRef, error: phoneError} = usePhoneMask(
        form.phone,
        (value) => setForm((prev: any) => ({...prev, phone: value}))
    );


    return (
        <section className={styles.wrapper}>
            <h3 className={styles.subtitle}>
                {isCreate ? "Create New Venue" : `Edit Venue ${venueId}`}
            </h3>

            <div className={styles.formWrapper}>
                <form className={styles.form} onSubmit={onSubmit}>
                    <div className={styles.coordinatesWrapper}>
                        <div className={styles.leftSideWrapper}>
                            <VenueSelectsComponent
                                country={form.country || ""}
                                city={form.city || ""}
                                setCountry={(country) =>
                                    setForm((prev: any) => ({...prev, country}))
                                }
                                setCity={(city) =>
                                    setForm((prev: any) => ({...prev, city}))
                                }
                                setCoordinates={(lat, lng) =>
                                    setForm((prev: any) => ({
                                        ...prev,
                                        latitude: lat,
                                        longitude: lng,
                                    }))
                                }
                            />

                            <div className={styles.inputWrapper}>
                                <label className={styles.label}>
                                    Venue Name *
                                </label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleInputChange}
                                    className={styles.inputCreate}
                                />
                            </div>

                            {isCreate && (
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>
                                        Tags (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={tagsInput}
                                        onChange={(e) =>
                                            setTagsInput?.(e.target.value)
                                        }
                                        className={styles.inputCreate}
                                    />
                                </div>
                            )}

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
                                <label className={styles.label}>Phone *</label>
                                <input
                                    ref={phoneRef}
                                    name="phone"
                                    className={styles.inputCreate}
                                    placeholder="+xx (xxx) xxx-xx-xx"
                                />
                                {phoneError && <p className={styles.error}>{phoneError}</p>}
                            </div>

                            <div className={styles.inputWrapper}>
                                <label className={styles.label}>Venue currency *</label>
                                <select
                                    name="currency"
                                    value={form.currency || "UAH"}
                                    disabled={!isCreate}
                                    onChange={(e) =>
                                        setForm((prev: any) => ({...prev, currency: e.target.value}))
                                    }
                                    className={styles.select}
                                >
                                    {CURRENCY_OPTIONS.map(c => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                                {isCreate && (
                                    <p className={styles.helperText}>
                                        Select the main currency for this venue.
                                        It will be used for all menus, logistics, and services.
                                    </p>
                                )}

                                {!isCreate && (
                                    <p className={styles.helperText}>
                                        Currency cannot be changed after venue creation.
                                    </p>
                                )}
                            </div>
                            <div className={styles.inputWrapper}>
                                <OpeningHoursFormComponent
                                    newVenue={form}
                                    setNewVenue={setForm}
                                />
                            </div>
                        </div>

                        <div className={styles.mapWrapper}>
                            {form.latitude &&
                            form.longitude &&
                            !isNaN(form.latitude) ? (
                                <MapVenueComponent
                                    lat={form.latitude}
                                    lng={form.longitude}
                                />
                            ) : (
                                <div className={styles.mapPlaceholder}>
                                    Coordinates will appear here after selecting city/country.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.bottomWrapper}>
                        <div className={styles.inputWrapper}>
                            <label className={styles.label}>
                                Description *
                            </label>
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
                            disabled={saving || !!phoneError}
                            className={styles.submitButton}
                        >
                            {saving ? (
                                <div
                                    className={`authButton ${styles.loaderWrapper}`}
                                >
                                    <LoaderComponent/>
                                </div>
                            ) : isCreate ? (
                                "Save Venue"
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};
