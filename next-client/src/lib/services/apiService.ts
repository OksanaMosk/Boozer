
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
        document.cookie = "authjs.session-token=; Max-Age=0; path=/";
        document.cookie = "refresh-token=; Max-Age=0; path=/";
        console.log(document.cookie);
        // alert(document.cookie);
      window.location.href = "/login";
    }
    return Promise.reject(e);
  }
);



  return instance;
};
export { apiService };









