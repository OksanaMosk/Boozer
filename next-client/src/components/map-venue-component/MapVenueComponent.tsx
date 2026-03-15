import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import styles from "./MapVenueComponent.module.css";
import {GOOGLE_MAPS_LIBRARIES} from "@/lib/services/geocodeService";

interface MapProps {
  lat: number;
  lng: number;
}

const MapVenueComponent = ({ lat, lng }: MapProps) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <GoogleMap
      center={{ lat, lng }}
      zoom={12}
        mapContainerClassName={styles.mapContainer}
       mapContainerStyle={{ height: "320px" }}
    >
      <Marker position={{ lat, lng }} />
    </GoogleMap>
  );
};

export default MapVenueComponent;
