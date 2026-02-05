import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {

  interface User extends DefaultUser {
    id: string;
    accessToken?: string;
    refreshToken?: string;
    role?: string;
    needsProfile?: boolean;
    expiresIn?: number;
  }

  interface Session {
    user: {
      id: string;
      accessToken?: string;
      refreshToken?: string;
      role?: string;
      needsProfile?: boolean;
      error?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken?: string;
    refreshToken?: string;
    role?: string;
    needsProfile?: boolean;
    accessTokenExpires?: number;
    error?: string;
  }
}
