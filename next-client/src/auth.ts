import NextAuth, {User, Session, Account} from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";


const apiUrl = process.env.INTERNAL_API_URL || "http://app:8000/api";

export const {handlers, auth, signIn, signOut} = NextAuth({
    secret: "f2998a4463a56289bc25752c00688094760a92026857187140f7d3d633596721",
    trustHost: true,
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60,
    },
    cookies: {
        sessionToken: {
            name: "authjs.session-token",
            options: {
                httpOnly: true,
                // sameSite: "none",
                secure: false,
                path: "/",
            },
        },
    },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
      Facebook({
          clientId: process.env.FACEBOOK_CLIENT_ID,
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          checks: ["state"],
          authorization: {
              params: {
                  scope: "email public_profile",
              }
          },
      }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
          try {
              // const res = await fetch("http://127.0.0.1:8888/api/auth/login/", {
              // const res = await fetch("http://app:8000/api/auth/login/", {
                const res = await fetch(`${apiUrl}/auth/login/`, {
                  method: "POST",
                  headers: {"Content-Type": "application/json"},
                  body: JSON.stringify(credentials),
              });
              console.log("DEBUG AUTH_URL:", process.env.AUTH_URL);
              console.log("DEBUG NEXTAUTH_URL:", process.env.NEXTAUTH_URL);

              const data = await res.json();

              console.log("Parsed data:", data)

              if (res.ok && data.access) {
                  return {
                      id: String(data.user?.id || data.id || data.user_id),
                      email: data.user?.email || data.email,
                      accessToken: data.access,
                      refreshToken: data.refresh,
                      role: data.user?.role,
                      expiresIn: data.expires_in || data.lifetime || 3600,
                      needsProfile:
                          !data.user?.profile?.birth_date ||
                          !data.user?.profile?.is_rules_accepted,
                      profile: data.user?.profile,
                  };
              }
              return null;
          } catch (error) {
              console.error("Login error:", error);
              return null;
          }
      },
    }),
  ],

  callbacks: {
  async jwt({ token, user, account }: { token: JWT; user?: User;   account?: Account | null; }) {
    // console.log("JWT", { token, user, account });

      if (user && account) {
          token.id = user.id;
          token.accessToken = user.accessToken;
          token.refreshToken = user.refreshToken;
          token.role = user.role ?? "visitor";
          token.profile = user.profile;
          token.needsProfile =
              !user?.profile?.birth_date || user?.profile?.birth_date === '' ||
              user?.profile?.is_rules_accepted === false;
          token.accessTokenExpires = Date.now() + ((user.expiresIn ?? 3600) - 60) * 1000;

          if (account.provider !== "credentials") {

        try {
          // const res = await fetch("http://127.0.0.1:8888/api/auth/social_jwt/", {
          //   const res = await fetch("http://app:8000/api/auth/social_jwt/", {
            const res = await fetch(`${apiUrl}/auth/social_jwt/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: account.provider,
              access_token: account.access_token,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            // console.log("DATA FROM BACKEND:", data);

            token.profile = {
              name: data.user?.profile?.name || "",
              surname: data.user?.profile?.surname || "",
              age: data.user?.profile?.age || 0,
              avatarUrl: data.user?.profile?.avatarUrl || null,
              phone: data.user?.profile?.phone || "",
              birth_date: data.user?.profile?.birth_date || "",
              is_rules_accepted: data.user?.profile?.is_rules_accepted || false,
            };

              token.accessToken = data.access_token;
              token.refreshToken = data.refresh_token;
              token.id = String(data.user.id);
              token.role = data.user.role ?? token.role;
              token.accessTokenExpires = Date.now() + ((data.expires_in || data.lifetime || 3600) - 60) * 1000;
              token.needsProfile =
                  !data.user?.profile?.birth_date || data.user?.profile?.birth_date === '' ||
                  data.user?.profile?.is_rules_accepted === false;
          }
        } catch (e) {
          console.error("Social sync error:", e);
        }
      }

      return token;
    }

    if (Date.now() < (token.accessTokenExpires as number)) {
      return token;
    }

    try {
      // const response = await fetch("http://127.0.0.1:8888/api/auth/refresh/", {
      // const response = await fetch("http://app:8888/api/auth/refresh/", {
        const response = await fetch(`${apiUrl}/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: token.refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { ...token, error: "RefreshAccessTokenError" };
      }

      const newExpiresIn = data.expires_in || data.lifetime || 3600;

      return {
        ...token,
        accessToken: data.access,
        refreshToken: data.refresh ?? token.refreshToken,
        accessTokenExpires: Date.now() + (Number(newExpiresIn) - 60) * 1000,
      };
    } catch (error) {
      return { ...token, error: "RefreshAccessTokenError" };
    }
  },

    async session({ session, token }: { session: Session; token: JWT } ) {

      if (token.error === "RefreshAccessTokenError") {

          session.user.id = "";
          session.user.email = "";
          session.user.accessToken = undefined;
          session.user.refreshToken = undefined;
          session.user.role = "visitor";
          session.user.needsProfile = false;
          session.user.profile = undefined;
          session.user.error = token.error;

      } else  if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.accessToken = token.accessToken;
        session.user.refreshToken = token.refreshToken;
        session.user.needsProfile = token.needsProfile;
        session.user.role = token.role;
        session.user.error = token.error;
        session.user.profile = token.profile;
      }
      return session;
    },

  },


  pages: { signIn: "/login", error: "/auth/error" },
});

