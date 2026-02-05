// import {authService} from "@/lib/services/authService";
// import {IUser} from "@/models/IUser";
// import {mapSessionToUser} from "@/utils/mapSessionToUser";
//
//
// export const getCookie = (name: string): string | null => {
//     return (
//         document.cookie
//             .split("; ")
//             .find((row) => row.startsWith(name + "="))
//             ?.split("=")[1] ?? null
//     );
// };
//
//
// export const loadUser = async (sessionUser?: any): Promise<IUser> => {
//     const authToken = getCookie("authToken");
//
//     if (authToken) {
//         const refreshToken = getCookie("refreshToken");
//         try {
//             return await authService.getCurrentUser(authToken);
//         } catch {
//             if (!refreshToken) throw new Error("Please log in again.");
//             try {
//                 const tokens = await authService.refreshToken(refreshToken);
//                 return await authService.getCurrentUser(tokens.access);
//             } catch {
//                 throw new Error("Your session has expired. Please log in again.");
//             }
//         }
//     } else if (sessionUser) {
//         return mapSessionToUser(sessionUser);
//     }
//
//     throw new Error("Please log in or activate your account.");
// };