import { apiService } from "./apiService";
import { urls } from "../constants/urls";
import { GetUserVenuesResponse } from "@/models/IVenue";
import { IUser } from "@/models/IUser";

const userService = {
  getAll: async (
    filterCriteria: { role?: string; is_active?: boolean; ordering?: string },
    token: { accessToken: string }
  ): Promise<IUser[]> => {
    const params = new URLSearchParams();
    if (filterCriteria.role) params.append("role", filterCriteria.role);
    if (filterCriteria.is_active !== undefined) params.append("is_active", String(filterCriteria.is_active));
    if (filterCriteria.ordering) params.append("ordering", filterCriteria.ordering);

    try {
      const response = await apiService(token.accessToken).get(`${urls.users.list}?${params.toString()}`);
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    } catch (err: any) {
      if (err.isUnauthorized) throw new Error("Please Sign In");
      throw err;
    }
  },

  toggleActive: async (userId: string, isActive: boolean, token: { accessToken: string }) => {
    try {
      const { data } = await apiService(token.accessToken).patch(urls.users.active(userId), { is_active: isActive });
      return data;
    } catch (err: any) {
      if (err.isUnauthorized) throw new Error("Please Sign In");
      throw err;
    }
  },

  changeRole: async (userId: string, role: string, token: { accessToken: string }) => {
    try {
      const { data } = await apiService(token.accessToken).patch(urls.users.changeRole(userId), { role });
      return data;
    } catch (err: any) {
      if (err.isUnauthorized) throw new Error("Please Sign In");
      throw err;
    }
  },

  delete: async (userId: string, token: { accessToken: string }) => {
    try {
      const { data } = await apiService(token.accessToken).delete(urls.users.delete(userId));
      return data;
    } catch (err: any) {
      if (err.isUnauthorized) throw new Error("Please Sign In");
      throw err;
    }
  },

  updateProfile: async (userId: string, formData: FormData, token: { accessToken: string }) => {
    try {
      const { data } = await apiService(token.accessToken).patch(urls.users.updateProfile(userId), formData);
      return data;
    } catch (err: any) {
      if (err.isUnauthorized) throw new Error("Please Sign In");
      throw err;
    }
  },

  getUserVenues: async (userId: string, token: { accessToken: string }) => {
    try {
      const response = await apiService(token.accessToken).get<GetUserVenuesResponse>(urls.users.userVenues(userId));
      return response.data;
    } catch (err: any) {
      if (err.isUnauthorized) throw new Error("Please Sign In");
      throw err;
    }
  },
};

export default userService;
