import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import styles from "./MapVenueComponent.module.css";

interface MapProps {
  lat: number;
  lng: number;
}

const MapVenueComponent = ({ lat, lng }: MapProps) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
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
