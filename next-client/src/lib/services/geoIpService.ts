export const fetchCoordinatesByIP = async () => {
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();

        return {
            lat: data.latitude,
            lng: data.longitude,
            city: data.city || ""
        };
    } catch (e) {
        return null;
    }
};