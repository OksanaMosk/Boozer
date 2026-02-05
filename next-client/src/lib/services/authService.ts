import {apiService} from "./apiService";
import {urls} from "../constants/urls";
import {IUser} from "@/models/IUser";
import {AxiosError} from "axios";
import { signIn } from "next-auth/react";
import { getSession } from "next-auth/react";

interface IRegisterUser {
    email: string;
    password: string;
    profile: IUser["profile"];
    role?: "visitor" | "venue_admin" | "admin";
}

const authService = {
    async login(user: { email: string; password: string }) {
        const result = await signIn("credentials", {
            email: user.email,
            password: user.password,
            redirect: false,
        });

        if (result?.error) {
            throw new Error("Невірний логін або пароль");
        }
const session = await getSession();
    if (!session?.user) {
      throw new Error("Не вдалося отримати сесію користувача");
    }

    return session.user;
  },


    async register(user: IRegisterUser): Promise<IUser> {
        try {
            const {data} = await apiService.post<IUser>(urls.auth.register, user);
            console.log("Success response:", data);
            return data;
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error("Register failed:", error.response?.status, error.response?.data);

            } else {
                console.error("Unexpected error:", error);
            }
            throw error;
        }
    },
    getSocketToken() {
        return apiService.get(urls.auth.socket);
    },

    async getCurrentUser(token: string | null): Promise<IUser | null> {
  if (!token) return null;
  try {
    const { data, status } = await apiService.get(urls.auth.me, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: (status) => status < 500,
    });
    if (status === 401 || status === 403) {
      console.log('[getCurrentUser] Unauthorized:', status);
      return null;
    }

    if (typeof window !== "undefined" && data.id) {
      localStorage.setItem("userId", data.id.toString());
    }
    return data;
  } catch (error) {
    console.log('[getCurrentUser] Error:', error);
    return null;
  }

}

}

export {authService};


