// import {IUser} from "@/models/IUser";
// import {auth} from "@/auth";
// import {authService} from "@/lib/services/authService";
// import {mapSessionToUser} from "@/utils/mapSessionToUser";
//
//
// export const loadUserServer = async (): Promise<IUser | null> => {
//     try {
//         const session = await auth();
//         if (!session?.user) {
//             return null;
//         }
//
//         const token = session.user.accessToken;
//         if (token) {
//             // Додаємо додатковий .catch прямо сюди, щоб 401 помилка
//             // просто повертала null і не "клала" весь серверний рендер
//             const fullUser = await authService.getCurrentUser(token)
//                 .catch((err) => {
//                     console.warn("Backend profile fetch failed (likely 401):", err.message);
//                     return null;
//                 });
//
//             if (fullUser) return fullUser;
//         }
//         return mapSessionToUser(session.user);
//     } catch (error) {
//         console.error("Critical error in loadUserServer:", error);
//         return null;
//     }
// };
