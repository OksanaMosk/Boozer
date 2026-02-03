import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
  async jwt({ token, account }) {
  console.log("JWT CALLBACK START", { account, token });

  if (account) {
    try {
      const res = await fetch("http://127.0.0.1:8888/api/auth/social_jwt/", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
              provider: account.provider,
              access_token: account.access_token,
          }),
      });
        if (!res.ok) {
            const text = await res.text();
            console.error("SOCIAL LOGIN BACKEND ERROR:", text);
            return token;
        }
        const data = await res.json();
        console.log("BACKEND RESPONSE", data);
        token.user = {
            id: data.user?.id ? String(data.user.id) : "",
            email: data.user?.email ?? token.email ?? "",
        };
        token.accessToken = data.access_token ?? token.accessToken;
        token.needsProfile = data.needs_profile ?? true;
    } catch (e) {
      console.error("JWT callback error:", e);
    }
  }
  return token;
},

    async session({ session, token }) {
  if (!token.user) {
    console.warn("SESSION CALLBACK — TOKEN USER MISSING", token);
    session.user.id = token.sub ?? ""; // fallback
    session.user.email = token.email ?? "";
    session.user.token = token.accessToken ?? "";
    session.user.needsProfile = token.needsProfile ?? true;
    return session;
  }


  session.user.id = token.user.id;
  session.user.email = token.user.email;
  session.user.token = token.accessToken ?? "";
  session.user.needsProfile = token.needsProfile ?? true;

  console.log("SESSION CALLBACK", { tokenUser: token.user, sessionUser: session.user });

  return session;
},
  },

  pages: {
    signIn: "/visitor",
    error: "/auth/error",
    newUser: "/complete-profile",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };



