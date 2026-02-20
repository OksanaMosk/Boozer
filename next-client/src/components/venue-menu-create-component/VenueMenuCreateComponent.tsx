"use client";

import React, {useEffect, useRef, useState} from "react";
import Image from "next/image";
import {useRouter} from "next/navigation";
import IMask from "imask";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import VenueSelectsComponent from "@/components/venue-selects-component/VenueSelectsComponent";
import MapVenueComponent from "@/components/map-venue-component/MapVenueComponent";

import {IMenu, ITag, IVenue} from "@/models/IVenue";
import {useUser} from "@/app/contexts/UserProvider";
import venueServices from "@/lib/services/venueService";

import styles from "./VenueMenuCreateComponent.module.css";
import {
    OpeningHoursFormComponent
} from "@/components/opening-hours-form-component/OpeningHoursFormComponent";

interface ILocalPhoto {
    file: File;
    preview_url: string;
    is_main?: boolean;
}

const VenueMenuCreateComponent = () => {
    const {user} = useUser();
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [phone, setPhone] = useState("");
    const [tagsInput, setTagsInput] = useState("");
    const [newVenueMenu, setNewVenueMenu] = useState<Partial<IMenu>>({
        name: "",
        photos: [],
    });
    const [localPhotos, setLocalPhotos] = useState<ILocalPhoto[]>([]);
    const [message, setMessage] = useState("");

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);

        if (localPhotos.length + files.length > 7) {
            setMessage("You can upload up to 7 photos.");
            return;
        }

        const newPhotos: ILocalPhoto[] = files.map((file) => ({
            file,
            preview_url: URL.createObjectURL(file),
            is_main: false,
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

    const venueData = {
        ...newVenue,

    };

    try {
        if (!user?.token) {
            setMessage("You must be logged in to create a venue.");
            return;
        }

        const createdVenue = await venueServices.venues.create(venueData, { accessToken: user.token });

        const venueId = createdVenue.data.id;
        setNewVenue(prev => ({ ...prev, id: venueId }));
        const token = user.token;

            try {
                return venueServices.venues.tags(venueId!).create({ name: tag.name }, { accessToken: token });
            } catch (err: any) {
                if (err.response?.data?.name?.[0]?.includes("already exists")) {
                    console.log(`Tag "${tag.name}" вже існує, пропускаємо створення`);
                    return {data: {id: tag.id || null, name: tag.name}};
                }
                throw err;
            }

        })
    );

    await Promise.all(
        createdTags.map(async (tagResp: { data: ITag }) => {
            console.log("Другий запит → прив'язуємо тег до закладу:", venueId);
            console.log("URL:", `/venues/${venueId}/venue_tags/`);
            console.log("Метод: POST");
            console.log("Body:", { tag_id: tagResp.data.id });
            console.log("Access Token:", token);
            if (!tagResp.data.id) return;
            return venueServices.venues.venueTags.create(
                venueId!,
                 { venue: venueId, tag: tagResp.data.id },
                { accessToken: token }
            );
        })
    );
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
        if (localPhotos.length === 0) return setMessage("Add at least one photo.");

        setLoadingPhotos(true);
        try {
            const photosToUpload = localPhotos.map((p, i) => ({
                ...p,
                is_main: p.is_main ?? i === 0
            }));

            for (const p of photosToUpload) {
                const formData = new FormData();
                formData.append("photo", p.file);
                formData.append("venue", newVenue.id!);
                formData.append("is_main", p.is_main ? "true" : "false");

                await venueServices.venuePhotos({accessToken: user.token}).create(newVenue.id, formData);
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



    return (
        <section className={styles.wrapper}>
            <h3 className={styles.subtitle}>Create New Venue</h3>

            <div className={styles.formWrapper}>
                <form className={styles.form} onSubmit={handleCreateVenue}>
                    <div className={styles.coordinatesWrapper}>
                        <div className={styles.leftSideWrapper}>
                            <VenueSelectsComponent
                                country={newVenue.country || ""}
                                city={newVenue.city || ""}
                                setCountry={(country) => setNewVenue((prev) => ({...prev, country}))}
                                setCity={(city) => setNewVenue((prev) => ({...prev, city}))}
                                setCoordinates={(lat, lng) =>
                                    setNewVenue((prev) => ({...prev, latitude: lat, longitude: lng}))
                                }
                            />
                            <div className={styles.inputWrapper}>
                                <label className={styles.label}>Venue Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={newVenue.name}
                                    onChange={handleInputChange}
                                    required
                                    className={styles.inputCreate}
                                />
                            </div>
                            <div className={styles.inputWrapper}>
                                <label className={styles.label}>Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    value={tagsInput}
                                    onChange={(e) => setTagsInput(e.target.value)}
                                    placeholder="Enter tags, comma-separated"
                                    className={styles.inputCreate}
                                />
                            </div>



                            <div className={styles.inputWrapper}>
                                <label className={styles.label}>Address *</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={newVenue.address}
                                    onChange={handleInputChange}
                                    className={styles.inputCreate}
                                />
                            </div>

                            <div className={styles.inputWrapper}>
                                <label className={styles.label}>Phone *</label>
                                <input
                                    className={styles.inputCreate}
                                    ref={inputRef}
                                    value={phone}
                                    onChange={handleInputChange}
                                    type="tel"
                                    name="phone"
                                    placeholder="+xx (xxx) xxx-xx-xx"
                                />
                            </div>

                            <div className={styles.inputWrapper}>
                                <div className={styles.inputWrapper}>
                                    <OpeningHoursFormComponent
                                        newVenue={newVenue}
                                        setNewVenue={setNewVenue}
                                    />
                                </div>
                            </div>


                        </div>

                        <div className={styles.mapWrapper}>
                            {newVenue.latitude &&
                            newVenue.longitude &&
                            !isNaN(newVenue.latitude) ? (
                                <MapVenueComponent
                                    lat={newVenue.latitude}
                                    lng={newVenue.longitude}
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
                            <label className={styles.label}>Description *</label>
                            <textarea
                                name="description"
                                value={newVenue.description}
                                onChange={handleInputChange}
                                required
                                className={styles.textarea}
                            />
                        </div>
                        <button type="submit" disabled={loadingVenue} className={styles.submitButton}>
                            {loadingVenue ? <div className={`authButton ${styles.loaderWrapper}`}><LoaderComponent/>
                            </div> : "Save Venue"}
                        </button>
                    </div>
                    {message && <p className={styles.success}>{message}</p>}
                </form>
            </div>
            <form onSubmit={handleAddPhotos} className={styles.photoWrapper}>
                <label className={styles.label}>Upload Photos (Max 7)</label>
                <input
                    type="file"
                    multiple
                    onChange={handlePhotoChange}
                    disabled={loadingPhotos || localPhotos.length >= 7}
                    className={styles.inputFile}
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
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="mainPhoto"
                                        checked={photo.is_main || false}
                                        onChange={() => {
                                            setLocalPhotos(prev =>
                                                prev.map((p, index) => ({...p, is_main: index === i}))
                                            );
                                        }}
                                    />
                                    Main
                                </label>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleDeletePhoto(i)}
                                className={styles.deleteButton}
                            >
                                Delete
                            </button>
                        </div>
                    ))}

                </div>
                {newVenue.id && localPhotos.length > 0 && (
                    <button type="submit" disabled={loadingPhotos} className={styles.submitButton}>
                        {loadingPhotos ? <div className={`authButton ${styles.loaderWrapper}`}><LoaderComponent/>
                        </div> : "Add Photos"}
                    </button>
                )}
            </form>
        </section>
    );
};

export default VenueMenuCreateComponent;





// const renderPreview = () => {
    //     switch (selectedStyle) {
    //         case "minimal":
    //             return <ThemeVenueMinimalComponent venue={newVenue} photos={localPhotos}/>;
    //         case "party":
    //             return <ThemeVenuePartyComponent venue={newVenue} photos={localPhotos}/>;
    //         case "eco":
    //         case "classic":
    //             return <p>Preview not implemented for {selectedStyle} style</p>;
    //         default:
    //         return null;
    //     }
    // };


 {/*<div className={styles.styleSelector}>*/}
            {/*    <label>Select Style: </label>*/}
            {/*    <select*/}
            {/*        value={selectedStyle}*/}
            {/*        onChange={(e) =>*/}
            {/*            setSelectedStyle(e.target.value as "minimal" | "eco" | "party" | "classic")*/}
            {/*        }*/}
            {/*    >*/}
            {/*        <option value="minimal">Minimal</option>*/}
            {/*        <option value="eco">Eco</option>*/}
            {/*        <option value="party">Party</option>*/}
            {/*        <option value="classic">Classic</option>*/}
            {/*    </select>*/}
            {/*    <div className={styles.livePreview}>{renderPreview()}</div>*/}
            {/*</div>*/}





// "use client";
//
// import React, { useEffect, useRef, useState } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import IMask from "imask";
//
// import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
// import VenueSelectsComponent from "@/components/venue-selects-component/VenueSelectsComponent";
// import ThemeVenueMinimalComponent from "@/components/theme-venue-minimal-component/ThemeVenueMinimalComponent";
// import ThemeVenuePartyComponent from "@/components/theme-venue-party-component/ThemeVenuePartyComponent";
// import MapVenueComponent from "@/components/map-venue-component/MapVenueComponent";
//
// import { IVenue } from "@/models/IVenue";
// import { useUser } from "@/app/contexts/UserProvider";
// import venueServices from "@/lib/services/venueService";
//
// import styles from "./VenueCreateComponent.module.css";
//
// interface ILocalPhoto {
//   file: File;
//   preview_url: string;
// }
//
// const VenueCreateComponent = () => {
//   const { user } = useUser();
//   const router = useRouter();
//   const inputRef = useRef<HTMLInputElement | null>(null);
//
//   const [phone, setPhone] = useState("");
//   const [newVenue, setNewVenue] = useState<Partial<IVenue>>({
//     name: "",
//     country: "",
//     city: "",
//     address: "",
//     latitude: 0,
//     longitude: 0,
//     phone: "",
//     description: "",
//     opening_hours: {},
//     features: {},
//     average_check: 0,
//     rating: 0,
//     reviews_count: 0,
//     status: "pending",
//     views: 0,
//     daily_views: 0,
//     weekly_views: 0,
//     monthly_views: 0,
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString(),
//     last_exchange_update: null,
//     tags: [],
//     photos: [],
//   });
//
//   const [localPhotos, setLocalPhotos] = useState<ILocalPhoto[]>([]);
//   const [message, setMessage] = useState("");
//   const [loadingVenue, setLoadingVenue] = useState(false);
//   const [loadingPhotos, setLoadingPhotos] = useState(false);
//
//   const [selectedStyle, setSelectedStyle] = useState<
//     "minimal" | "eco" | "party" | "classic"
//   >("minimal");
//
//   // Маска телефону
//   useEffect(() => {
//     if (inputRef.current) {
//       const maskOptions = { mask: "+{00} (000) 000-00-00" };
//       const mask = IMask(inputRef.current, maskOptions);
//
//       mask.on("accept", () => {
//         setPhone(mask.value);
//       });
//
//       return () => {
//         mask.destroy();
//       };
//     }
//   }, []);
//
//   useEffect(() => {
//     setNewVenue((prev) => ({ ...prev, phone }));
//   }, [phone]);
//
//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     const { name, value, type } = e.target;
//     let newValue: any;
//
//     if (type === "checkbox" && "checked" in e.target) {
//       newValue = e.target.checked;
//     } else if (type === "number") {
//       newValue = Number(value);
//     } else {
//       newValue = value;
//     }
//
//     if (name === "phone") {
//       setPhone(newValue);
//     } else {
//       setNewVenue((prev) => ({ ...prev, [name]: newValue }));
//     }
//   };
//
//   const isValidPhone = (phone: string) => {
//     const re = /^\+\d{2} \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
//     return re.test(phone);
//   };
//
//   const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files) return;
//
//     const files = Array.from(e.target.files);
//
//     if (localPhotos.length + files.length > 7) {
//       setMessage("You can upload up to 7 photos.");
//       return;
//     }
//
//     const newPhotos: ILocalPhoto[] = files.map((file) => ({
//       file,
//       preview_url: URL.createObjectURL(file),
//     }));
//
//     setLocalPhotos((prev) => [...prev, ...newPhotos]);
//   };
//
//   const handleDeletePhoto = (index: number) => {
//     setLocalPhotos((prev) => prev.filter((_, i) => i !== index));
//   };
//
//
//   const handleCreateVenue = async (e: React.SyntheticEvent) => {
//     e.preventDefault();
//     setMessage("");
//
//     const requiredFields: (keyof IVenue)[] = ["name", "country", "city", "description"];
//     for (const field of requiredFields) {
//       if (!newVenue[field]) {
//         setMessage(`Field "${field}" is required.`);
//         return;
//       }
//     }
//
//     if (phone && !isValidPhone(phone)) {
//       setMessage("Phone number must be in format +xx (xxx) xxx-xx-xx");
//       return;
//     }
//
//       setLoadingVenue(true);
//       try {
//           if (!user?.token) return setMessage("You must be logged in to create a venue.");
//
//           const venueData = {
//               ...newVenue,
//               venue_admin: user.id
//           };
//
//
//           const createdVenue = await venueServices.venues.create(venueData, {accessToken: user.token});
//           setNewVenue((prev) => ({...prev, id: createdVenue.data.id}));
//
//           setMessage("Venue created successfully! You can now upload photos.");
//     } catch (err: any) {
//       setMessage(err?.response?.data?.detail || "Error creating venue.");
//     } finally {
//       setLoadingVenue(false);
//     }
//   };
//
//   const handleAddPhotos = async (e: React.SyntheticEvent) => {
//     e.preventDefault();
//     setMessage("");
//
//     if (!user?.token) return;
//     if (!newVenue.id) return setMessage("Create the venue first.");
//     if (localPhotos.length === 0) return setMessage("Add at least one photo.");
//
//     setLoadingPhotos(true);
//     try {
//       for (const p of localPhotos) {
//         const formData = new FormData();
//         formData.append("photo", p.file);
//         formData.append("venue", newVenue.id!);
//
//         await venueServices.venuePhotos({ accessToken: user.token }).create(newVenue.id, formData);
//       }
//
//       setMessage("Photos uploaded successfully!");
//       setLocalPhotos([]);
//       router.push(`/venue-admin/venues/${newVenue.id}`);
//     } catch {
//       setMessage("Error uploading photos.");
//     } finally {
//       setLoadingPhotos(false);
//     }
//   };
//
//   const renderPreview = () => {
//     switch (selectedStyle) {
//       case "minimal":
//         return <ThemeVenueMinimalComponent venue={newVenue} photos={localPhotos} />;
//       case "party":
//         return <ThemeVenuePartyComponent venue={newVenue} photos={localPhotos} />;
//       case "eco":
//       case "classic":
//         return <p>Preview not implemented for {selectedStyle} style</p>;
//     }
//   };
//
//   return (
//     <section className={styles.wrapper}>
//       <h3 className={styles.subtitle}>Create New Venue</h3>
//
//       <div className={styles.formWrapper}>
//         <form className={styles.form} onSubmit={handleCreateVenue}>
//             <div className={styles.coordinatesWrapper}>
//                 <div className={styles.leftSideWrapper}>
//                     <VenueSelectsComponent
//                     country={newVenue.country || ""}
//                     city={newVenue.city || ""}
//                     setCountry={(country) => setNewVenue((prev) => ({...prev, country}))}
//                     setCity={(city) => setNewVenue((prev) => ({...prev, city}))}
//                     setCoordinates={(lat, lng) =>
//                         setNewVenue((prev) => ({...prev, latitude: lat, longitude: lng}))
//                     }
//                 />
//                     <div className={styles.inputWrapper}>
//                         <label className={styles.label}>Venue Name *</label>
//                         <input
//                             type="text"
//                             name="name"
//                             value={newVenue.name}
//                             onChange={handleInputChange}
//                             required
//                             className={styles.inputCreate}
//                         />
//                     </div>
//
//                     <div className={styles.inputWrapper}>
//                         <label className={styles.label}>Address *</label>
//                         <input
//                             type="text"
//                             name="address"
//                             value={newVenue.address}
//                             onChange={handleInputChange}
//                             className={styles.inputCreate}
//                         />
//                     </div>
//
//                     <div className={styles.inputWrapper}>
//                         <label className={styles.label}>Phone *</label>
//                         <input
//                             className={styles.inputCreate}
//                             ref={inputRef}
//                             value={phone}
//                             onChange={handleInputChange}
//                             type="tel"
//                             name="phone"
//                             placeholder="+xx (xxx) xxx-xx-xx"
//                         />
//                     </div>
//                 </div>
//
//                 <div className={styles.mapWrapper}>
//                     {newVenue.latitude &&
//                     newVenue.longitude &&
//                     !isNaN(newVenue.latitude) ? (
//                         <MapVenueComponent
//                             lat={newVenue.latitude}
//                             lng={newVenue.longitude}
//                         />
//                     ) : (
//                         <div className={styles.mapPlaceholder}>
//                             Coordinates will appear here after selecting city/country.
//                         </div>
//                     )}
//                 </div>
//             </div>
//
//
//
//
//             <div className={styles.bottomWrapper}>
//
//                 <div className={styles.inputWrapper}>
//                     <label className={styles.label}>Description *</label>
//                     <textarea
//                         name="description"
//                         value={newVenue.description}
//                         onChange={handleInputChange}
//                         required
//                         className={styles.textarea}
//                     />
//                 </div>
//                 <button type="submit" disabled={loadingVenue} className={styles.submitButton}>
//                 {loadingVenue ? <div className={`authButton ${styles.loaderWrapper}`}><LoaderComponent/></div> : "Save Venue"}
//             </button>
//             </div>
//             {message && <p className={styles.success}>{message}</p>}
//         </form>
//       </div>
//         <form onSubmit={handleAddPhotos} className={styles.photoWrapper }>
//             <label className={styles.label}>Upload Photos (Max 7)</label>
//             <input
//                 type="file"
//                 multiple
//                 onChange={handlePhotoChange}
//                 disabled={loadingPhotos || localPhotos.length >= 7}
//                 className={styles.inputFile}
//             />
//
//             <div className={styles.photoContainer}>
//                 {localPhotos.map((photo, i) => (
//                     <div className={styles.photoArray} key={i}>
//                         <Image
//                             className={styles.photoImage}
//                             src={photo.preview_url}
//                             alt=""
//                             width={140}
//                             height={100}
//                         />
//                         <button
//                             type="button"
//                             onClick={() => handleDeletePhoto(i)}
//                             className={styles.deleteButton}
//                         >
//                             Delete
//                         </button>
//                     </div>
//                 ))}
//
//             </div>
//             {newVenue.id && localPhotos.length > 0 && (
//                 <button type="submit" disabled={loadingPhotos} className={styles.submitButton}>
//                     {loadingPhotos ?  <div className={`authButton ${styles.loaderWrapper}`}><LoaderComponent/></div> : "Add Photos"}
//                 </button>
//             )}
//         </form>
//         <div className={styles.styleSelector}>
//             <label >Select Style: </label>
//             <select
//                 value={selectedStyle}
//                 onChange={(e) =>
//                     setSelectedStyle(e.target.value as "minimal" | "eco" | "party" | "classic")
//                 }
//             >
//                 <option value="minimal">Minimal</option>
//                 <option value="eco">Eco</option>
//                 <option value="party">Party</option>
//                 <option value="classic">Classic</option>
//             </select>
//             <div className={styles.livePreview}>{renderPreview()}</div>
//         </div>
//
//     </section>
//   );
// };
//
// export default VenueCreateComponent;