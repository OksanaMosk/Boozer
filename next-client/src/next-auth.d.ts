import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {

  interface User extends DefaultUser {
    id: string;
    accessToken?: string;
    refreshToken?: string;
    role?: string;
    needsProfile?: boolean;
    expiresIn?: number;
     profile?: {
      name: string;
      surname: string;
      age: number;
      avatarUrl: string | null;
      phone: string;
    birth_date: string;
    is_rules_accepted: boolean;
    };
  }

  interface Session {
    user: {
      id: string;
      accessToken?: string;
      refreshToken?: string;
      role?: string;
      needsProfile?: boolean;
      error?: string;
      profile?: {
        name: string;
        surname: string;
        age: number;
        avatarUrl: string | null;
        phone: string;
    birth_date: string;
    is_rules_accepted: boolean;
      };
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken?: string;
    refreshToken?: string;
    role?:  "visitor" | "venue_admin" | "admin";
    needsProfile?: boolean;
    accessTokenExpires?: number;
    error?: string;
    profile?: {
      name: string;
      surname: string;
      age: number;
      avatarUrl: string | null;
      phone: string;
    birth_date: string;
    is_rules_accepted: boolean;
    };
  }
}
