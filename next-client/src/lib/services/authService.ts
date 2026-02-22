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
    role?: IUser["role"]
}

const authService = {
    async login(user: { email: string; password: string }) {
        const result = await signIn("credentials", {
            email: user.email,
            password: user.password,
            redirect: false,
        });

        if (result?.error) {
            throw new Error("🔒 Invalid login or password");
        }
        const session = await getSession();
        if (!session?.user) {
            throw new Error("⚠️ Failed to retrieve user session");
        }

        return session.user;
    },


    async register(user: IRegisterUser): Promise<IUser> {
        try {
            const {data} = await apiService().post<IUser>(urls.auth.register, user);
            // console.log("Success response:", data);
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
        return apiService().get(urls.auth.socket);
    },
}

export {authService};


