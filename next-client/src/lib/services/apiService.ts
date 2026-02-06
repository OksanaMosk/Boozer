import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const apiService = (accessToken?: string) => {
  const instance = axios.create({
    baseURL
  });
  if (accessToken) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  }
  return instance;
};
export { apiService };









