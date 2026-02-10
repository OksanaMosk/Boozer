import { apiService } from "./apiService";
import { IUser } from "@/models/IUser";
import {urls} from "@/lib/constants/urls";

export type ProfilePayload = Partial<IUser["profile"]>;

const profileService = {
    updateProfile: async (
        userId: string,
        payload: ProfilePayload,
        token: string
    ) => {
        const {data} = await apiService(token).patch(
            urls.profile.update(userId),
            payload
        );
        return data;
    },


    getProfile: async (
        userId: string,
        token: string
    ) => {
        try {
            const {data} = await apiService(token).get(
                urls.profile.get(userId),
                {
                    validateStatus: (status) => status < 500
                }
            );
            if (!data) {
                return null;
            }
            return data;
        } catch (error: any) {
            throw error;
        }
    },
};

 // createProfile: async (
    //     userId: string,
    //     payload: ProfilePayload,
    //     token: string) => {
    //     const {data} = await apiService(token).post(
    //         urls.profile.create(userId),
    //         payload,
    //     );
    //     return data;
    // },

//   getProfile: async (
//       userId: string,
//       token: string
//   ) => {
//     const { data } = await apiService(token).get(
//         urls.profile.get(userId),
//        );
//     console.log("userId:", userId)
// console.log("token:", token)
//     return data;
//   },
// };


export default profileService;
