import axios, {AxiosError, AxiosHeaders, AxiosRequestConfig} from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const apiService = axios.create({baseURL});

if (typeof window !== "undefined") {
    apiService.interceptors.request.use((req) => {
        const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("authToken="))
            ?.split("=")[1];
        if (!req.headers) {
            req.headers = new AxiosHeaders();
        }
        if (token) {
            req.headers.set("Authorization", `Bearer ${token}`);
        }
        return req;
    });

    apiService.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                const refreshToken = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("refreshToken="))
                    ?.split("=")[1];
                if (refreshToken) {
                    try {
                        const response = await axios.post(`${baseURL}/auth/refresh/`, {
                            refreshToken
                        });
                        const {access} = response.data;
                        if (originalRequest.headers) {
                            document.cookie = `authToken=${access}; path=/; max-age=${7 * 24 * 60 * 60}; sameSite=strict; HttpOnly; Secure`;
                            originalRequest.headers["Authorization"] = `Bearer ${access}`;
                            return axios(originalRequest);
                        }
                    } catch {
                        window.location.replace("/login");
                    }
                } else {
                    window.location.replace("/login");
                }
            }
            return Promise.reject(error);
        }
    );
}
export {apiService};









