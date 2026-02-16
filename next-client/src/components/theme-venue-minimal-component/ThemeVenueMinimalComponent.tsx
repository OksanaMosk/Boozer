import React from "react";
import { IVenue } from "@/models/IVenue";
import MapVenueComponent from "@/components/map-venue-component/MapVenueComponent";
import styles from "./ThemeVenueMinimalComponent.module.css";

interface ILocalPhoto {
  file: File;
  preview_url: string;
}

interface Props {
  venue: Partial<IVenue>;
  photos: ILocalPhoto[];
}

const ThemeVenueMinimalComponent: React.FC<Props> = ({ venue, photos }) => {
  const hasCoordinates =
    typeof venue.latitude === "number" &&
    typeof venue.longitude === "number";

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>{venue.name || "Venue Name"}</h2>
        <p className={styles.location}>
          {venue.city && venue.country
            ? `${venue.city}, ${venue.country}`
            : "Location"}
        </p>
      </div>

      <div className={styles.infoSection}>
        {venue.address && (
          <p><strong>Address:</strong> {venue.address}</p>
        )}
        {venue.phone && (
          <p><strong>Phone:</strong> {venue.phone}</p>
        )}
      </div>

      <p className={styles.description}>
        {venue.description || "Description..."}
      </p>

      {hasCoordinates && (
        <div className={styles.mapWrapper}>
          <MapVenueComponent
            lat={venue.latitude!}
            lng={venue.longitude!}
          />
        </div>
      )}

      <div className={styles.photoContainer}>
        {photos.map((p, i) => (
          <img
            key={i}
            src={p.preview_url}
            alt={`photo-${i}`}
            className={styles.photo}
          />
        ))}
      </div>
    </div>
  );
};

export default ThemeVenueMinimalComponent;

