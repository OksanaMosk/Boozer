import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const apiService = axios.create({
    baseURL,
    withCredentials: true,
});

export { apiService };









