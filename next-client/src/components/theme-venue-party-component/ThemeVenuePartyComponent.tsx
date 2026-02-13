"use client"
import React from "react";
import { IVenue } from "@/models/IVenue";

interface ILocalPhoto {
  file: File;
  preview_url: string;
}

interface ThemeVenuePartyProps {
  venue: Partial<IVenue>;
  photos: ILocalPhoto[];
}

const ThemeVenuePartyComponent: React.FC<ThemeVenuePartyProps> = ({ venue, photos }) => {
  return (
    <div
      style={{
        background: "#f3e5f5",
        color: "#8e24aa",
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        minHeight: 300,
      }}
    >
      <h2 style={{ marginBottom: 5 }}>{venue.name || "Party Venue"}</h2>
      <p style={{ fontStyle: "italic", marginBottom: 10 }}>
        {venue.city && venue.country ? `${venue.city}, ${venue.country}` : "Location"}
      </p>
      <p style={{ marginBottom: 15 }}>{venue.description || "Fun & energetic description..."}</p>
      <div
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          paddingBottom: 5,
        }}
      >
        {photos.map((p, i) => (
          <img
            key={i}
            src={p.preview_url}
            alt={`photo-${i}`}
            style={{
              width: 140,
              height: 140,
              objectFit: "cover",
              borderRadius: 10,
              flexShrink: 0,
              border: "2px solid #fff",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ThemeVenuePartyComponent;
