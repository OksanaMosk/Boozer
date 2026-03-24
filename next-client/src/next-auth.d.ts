import {DefaultSession, DefaultUser} from "next-auth";

declare module "next-auth" {

    interface User extends DefaultUser {
        id: string;
        accessToken?: string;
        refreshToken?: string;
        role?:UserRole;
        needsProfile?: boolean;
        expiresIn?: number;
        profile?: UserProfile;
    }

    interface Session {
        user: {
            id: string;
            accessToken?: string;
            refreshToken?: string;
            role?: UserRole;
            needsProfile?: boolean;
            error?: string;
            profile?: UserProfile;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        accessToken?: string;
        refreshToken?: string;
        role?: UserRole;
        needsProfile?: boolean;
        accessTokenExpires?: number;
        error?: string;
        profile?: UserProfile;
    }
}

export interface UserProfile {
    name: string;
    surname: string;
    age: number;
    avatar: string | null;
    phone: string;
    birth_date: string;
    is_rules_accepted: boolean;
}
export type UserRole = "visitor" | "venue_admin" | "admin";