import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

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
      mapContainerStyle={{ width: "100%", height: "300px" }}
    >
      <Marker position={{ lat, lng }} />
    </GoogleMap>
  );
};

export default MapVenueComponent;
