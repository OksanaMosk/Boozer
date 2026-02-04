

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
      needsProfile?: boolean;
    accessToken?: string;
    refreshToken?: string;
    user: {
      id: string;
      email: string;
      token: string;
      needsProfile: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    user?: {
      id: string;
      email: string;
      token: string;
    };
    needsProfile?: boolean;
  }
}