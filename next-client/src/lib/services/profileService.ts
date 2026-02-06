import { apiService } from "./apiService";
import { IUser } from "@/models/IUser";
import {urls} from "@/lib/constants/urls";

export type ProfilePayload = Partial<IUser["profile"]>;

const profileService = {
  createProfile: async (
      userId: string,
      payload: ProfilePayload,
      token: string) => {
    const { data } = await apiService(token).post(
      urls.profile.create(userId),
      payload,
    );
    return data;
  },

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
    const { data } = await apiService(token).get(
        urls.profile.get(userId),
       );
    return data;
  },
};


export default profileService;
