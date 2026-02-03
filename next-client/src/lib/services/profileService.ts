import { apiService } from "./apiService";
import { IUser } from "@/models/IUser";
import {urls} from "@/lib/constants/urls";

export type ProfilePayload = Partial<IUser["profile"]>;

const profileService = {
  createProfile: async (userId: string, payload: ProfilePayload, token: string) => {
    const { data } = await apiService.post(
      urls.profile.create(userId),
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return data;
  },

  updateProfile: async (userId: string, payload: ProfilePayload, token: string) => {
    const { data } = await apiService.patch(
      urls.profile.update(userId),
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return data;
  },

  getProfile: async (userId: string, token: string) => {
    const { data } = await apiService.get(urls.profile.get(userId), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
};


export default profileService;
