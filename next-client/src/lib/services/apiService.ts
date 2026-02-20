// import axios from "axios";
// import { signIn } from "next-auth/react";
//
// const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
//
// const apiService = (accessToken?: string) => {
//   const instance = axios.create({
//     baseURL
//   });
//
//   if (accessToken) {
//     instance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
//   }
//
//   instance.interceptors.response.use(
//     (response) => response,
//     (error) => {
//       if (error.response?.status === 401) {
//         console.warn("401 Unauthorized — redirecting to login");
//        void signIn("credentials", { redirect: true, redirectTo: "/login" });
//       }
//       return Promise.reject(error);
//     }
//   );
//
//   return instance;
// };
//
// export { apiService };





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









