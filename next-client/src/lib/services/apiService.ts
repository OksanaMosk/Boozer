
import axios from "axios";
const isServer = typeof window === "undefined";

// const baseURL = isServer
//   ? (process.env.INTERNAL_API_URL || "http://localhost/api")
//   : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888/api");

const baseURL = isServer
  ? process.env.INTERNAL_API_URL
  : process.env.NEXT_PUBLIC_API_URL;
if (!baseURL) {
  console.warn("API URL is not defined! Check your .env files.");
}

const apiService = (accessToken?: string) => {
    const instance = axios.create({
        baseURL
    });
    if (accessToken) {
        instance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    }

    instance.interceptors.response.use(
        r => r,
        e => {
            if (e.response?.status === 401) {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("unauthorized-access"));
            }

            const authError = new Error("Please Sign In") as any;
            authError.isUnauthorized = true;

            return Promise.reject(authError);
        }
        return Promise.reject(e);
    }
);
    return instance;
};
export {apiService};
