"use client";
import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, Polyline, Marker, useJsApiLoader } from "@react-google-maps/api";

const LIBRARIES: ("geometry" | "drawing" | "places")[] = ["geometry"];

const darkGoldenStyle = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1f2937" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#ae8625" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d4af37" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#1f2937" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
];
const BoozerTravelMapComponent = ({ mapData }: { mapData: any }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: LIBRARIES,
    });
    const mapRef = useRef<google.maps.Map | null>(null);
    const [busPath, setBusPath] = useState<google.maps.LatLng[]>([]);
    const [finalPath, setFinalPath] = useState<google.maps.LatLng[]>([]);
    const [busPos, setBusPos] = useState<google.maps.LatLngLiteral | null>(null);
    const [planePos, setPlanePos] = useState<google.maps.LatLngLiteral | null>(null);
    const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>(mapData.start);
    const [busRotation, setBusRotation] = useState(0);
    const [planeRotation, setPlaneRotation] = useState(0);
    const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const smoothProgress = (elapsed: number, duration: number) => {
    const ramp = 3000;
    if (duration < ramp * 2) return elapsed / duration;
    if (elapsed < ramp) {
        return 0.5 * Math.pow(elapsed / ramp, 2) * (ramp / duration);
    } else if (elapsed > duration - ramp) {
        const t = (duration - elapsed) / ramp;
        return 1 - 0.5 * Math.pow(t, 2) * (ramp / duration);
    } else {
        return (elapsed - ramp * 0.5) / duration;
    }
};
    useEffect(() => {
        if (!isLoaded || !mapData) return;
        const ds = new google.maps.DirectionsService();
        ds.route({ origin: mapData.start, destination: mapData.airStart, travelMode: google.maps.TravelMode.DRIVING }, (res, status) => {
            if (status === "OK" && res) setBusPath(res.routes[0].overview_path);
        });
        ds.route({ origin: mapData.airEnd, destination: mapData.end, travelMode: google.maps.TravelMode.DRIVING }, (res, status) => {
            if (status === "OK" && res) setFinalPath(res.routes[0].overview_path);
        });
    }, [isLoaded, mapData]);

    useEffect(() => {
        if (!isLoaded || busPath.length === 0 || finalPath.length === 0 || !mapRef.current) return;
        const DURATION_BUS_1 = 20000;
        const DURATION_PLANE = 15000;
        const DURATION_BUS_2 = 20000;
        const TOTAL_TIME = DURATION_BUS_1 + DURATION_PLANE + DURATION_BUS_2;
        let startTime: number;
        let lastPhase = -1;
        const animate = (time: number) => {
            if (!startTime) startTime = time;
            const elapsed = (time - startTime) % TOTAL_TIME;
            const map = mapRef.current;
            if (!map) return;
            if (elapsed < DURATION_BUS_1) {
                if (lastPhase !== 1) {
                    map.setOptions({ zoom: 15, tilt: 45 });
                    lastPhase = 1;
                }
                const f = smoothProgress(elapsed, DURATION_BUS_1);
                const idx = Math.floor(f * (busPath.length - 1));
                const curr = busPath[idx];
                const pos = { lat: curr.lat(), lng: curr.lng() };
                setBusPos(pos);
                setMapCenter(pos);
                setBusRotation(google.maps.geometry.spherical.computeHeading(curr, busPath[idx+1] || curr));
                setPlanePos(null);
                map.setCenter(pos);
            }
            else if (elapsed < DURATION_BUS_1 + DURATION_PLANE) {
                if (lastPhase !== 2) {
                    const bounds = new google.maps.LatLngBounds();
                    bounds.extend(mapData.airStart);
                    bounds.extend(mapData.airEnd);
                    map.fitBounds(bounds, 100);
                    lastPhase = 2;
                }
                const f = easeInOut((elapsed - DURATION_BUS_1) / DURATION_PLANE);
                const p1 = new google.maps.LatLng(mapData.airStart);
                const p2 = new google.maps.LatLng(mapData.airEnd);
                const currP = google.maps.geometry.spherical.interpolate(p1, p2, f);
                const posP = { lat: currP.lat(), lng: currP.lng() };
                setPlanePos(posP);
                setPlaneRotation(google.maps.geometry.spherical.computeHeading(currP, google.maps.geometry.spherical.interpolate(p1, p2, f + 0.01)));
                setBusPos(null);
            }
            else {
                if (lastPhase !== 3) {
                    map.setOptions({ zoom: 15, tilt: 45 });
                    lastPhase = 3;
                }
                const f = smoothProgress(elapsed - (DURATION_BUS_1 + DURATION_PLANE), DURATION_BUS_2);
                const idx = Math.floor(f * (finalPath.length - 1));
                const curr = finalPath[idx];
                const pos = { lat: curr.lat(), lng: curr.lng() };
                setBusPos(pos);
                setMapCenter(pos);
                setBusRotation(google.maps.geometry.spherical.computeHeading(curr, finalPath[idx+1] || curr));
                setPlanePos(null);
                map.setCenter(pos);
            }
            requestAnimationFrame(animate);
        };
        const animId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animId);
    }, [isLoaded, busPath, finalPath, mapData]);
    if (!isLoaded) return <div>Завантаження...</div>;
        const BUS_ICON = {
        path: "M6,2 L18,2 Q20,2 20,4 L20,40 Q20,42 18,42 L6,42 Q4,42 4,40 L4,4 Q4,2 6,2 M4,6 L20,6 M4,10 L20,10 M2,8 L4,8 M20,8 L22,8",
        fillColor: "#d4af37",
        fillOpacity: 1,
        scale: 1,
        anchor: isLoaded ? new google.maps.Point(12, 22) : undefined,
    };
    const PLANE_ICON = {
        path: "M21,16L21,14L13,9L13,3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5L10,9L2,14L2,16L10,13.5L10,18L8,19.5L8,21L11.5,20L15,21L15,19.5L13,18L13,13.5L21,16Z",
        fillColor: "#d4af37", fillOpacity: 1,  scale: 1.8, anchor: isLoaded ? new google.maps.Point(12, 12) : undefined,
    };
    return (
        <GoogleMap
            mapContainerStyle={{ width: '100%', height: '700px', borderRadius: '15px' }}
            onLoad={(map) => { mapRef.current = map; }}
            center={mapCenter} // ТЕПЕР ЦЕНТР ПРИВ'ЯЗАНИЙ ДО СТЕЙТУ
            options={{ styles: darkGoldenStyle, disableDefaultUI: true, gestureHandling: 'none' }}
        >
            {busPath.length > 0 && <Polyline path={busPath} options={{ strokeColor: "#d4af37", strokeWeight: 4 }} />}
            {finalPath.length > 0 && <Polyline path={finalPath} options={{ strokeColor: "#d4af37", strokeWeight: 4 }} />}
            {mapData.airStart && mapData.airEnd && (
                <Polyline path={[mapData.airStart, mapData.airEnd]} options={{
                        strokeColor: "#d4af37", strokeOpacity: 0, geodesic: true,
                        icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 2 }, offset: '0', repeat: '18px' }]
                }} />
            )}
            {busPos && <Marker position={busPos} icon={{ ...BUS_ICON, rotation: busRotation }} />}
            {planePos && <Marker position={planePos} icon={{ ...PLANE_ICON, rotation: planeRotation }} />}
        </GoogleMap>
    );
};

export default BoozerTravelMapComponent;


