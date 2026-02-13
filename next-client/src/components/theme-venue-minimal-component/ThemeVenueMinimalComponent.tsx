import React from "react";
import { IVenue } from "@/models/IVenue";

interface ILocalPhoto {
  file: File;
  preview_url: string;
}

interface Props {
  venue: Partial<IVenue>;
  photos: ILocalPhoto[];
}

const ThemeVenueMinimalComponent: React.FC<Props> = ({ venue, photos }) => {
  return (
    <div style={{
      background: "#d4af37",
      color: "#333",
      borderRadius: 8,
      padding: 20,
      border: "1px solid #ddd",
      minHeight: 250
    }}>
      <h2>{venue.name || "Venue Name"}</h2>
      <p style={{ fontStyle: "italic", color: "#555" }}>
        {venue.city && venue.country ? `${venue.city}, ${venue.country}` : "Location"}
      </p>
      <p>{venue.description || "Description..."}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {photos.map((p, i) => (
          <img key={i} src={p.preview_url} alt={`photo-${i}`} style={{
            width: 80,
            height: 80,
            objectFit: "cover",
            borderRadius: 4,
            border: "1px solid #ccc"
          }}/>
        ))}
      </div>
    </div>
  );
};

export default ThemeVenueMinimalComponent;
