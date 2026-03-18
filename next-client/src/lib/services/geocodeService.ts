const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export const GOOGLE_MAPS_LIBRARIES: ("geometry" | "places")[] = ["geometry"];

export const fetchCoordinates = async (city: string, country: string) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)},${encodeURIComponent(country)}&key=${apiKey}&language=en`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === "OK") {
            const location = data.results[0].geometry.location;
            return {latitude: location.lat, longitude: location.lng};
        } else {
            console.error(`Geocode API Error: ${data.status}`);
            throw new Error(`Geocode failed with status: ${data.status}`);
        }
    } catch (error) {
        console.error("Error fetching coordinates:", error);
        throw error;
    }
};