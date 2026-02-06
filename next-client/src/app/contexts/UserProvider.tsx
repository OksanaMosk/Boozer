"use client";

import React, { useContext, useEffect, useState, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { IUser, UserContextType } from "@/models/IUser";

const UserContext = React.createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.error === "RefreshAccessTokenError") {
      void signOut({redirectTo: "/login" });
      return;
    }
    if (status === "authenticated" && session?.user) {
      const mappedUser: IUser = {
        email: session.user.email || "",
        token: session.user.accessToken || "",
        role: (session.user.role || "visitor") as "visitor" | "venue_admin" | "admin",
        profile: {
          name: session.user.profile?.name || session.user.name || "",
          surname: session.user.profile?.surname || "",
          phone: session.user.profile?.phone || "",
          birth_date: session.user.profile?.birth_date || "",
          is_rules_accepted: session.user.profile?.is_rules_accepted || false,
        },
      };

      setUser(mappedUser);
      setLoading(false);
    }
    else if (status === "unauthenticated") {
      setUser(null);
      setLoading(false);
    }
  }, [status, session]);

  const value = useMemo(() => ({
    user,
    loading,
    setUser
  }), [user, loading]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};






// "use client";
//
// import React, { createContext, useContext, useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
//
// import { IUser } from "@/models/IUser";
//
// type UserContextType = {
//   user: IUser | null;
//   loading: boolean;
//   setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
// };
//
// const UserContext = createContext<UserContextType | undefined>(undefined);
//
// export function UserProvider({ children }: { children: React.ReactNode }) {
//   const { data: session, status } = useSession();
//   const [user, setUser] = useState<IUser | null>(null);
//   const [loading, setLoading] = useState(true);
//
//   // Синхронізація контексту з session
//   useEffect(() => {
//     if (status === "authenticated" && session?.user) {
//       setUser(session.user as IUser);
//       setLoading(false);
//     } else if (status === "unauthenticated") {
//       setUser(null);
//       setLoading(false);
//     }
//   }, [status, session]);
//
//   return (
//     <UserContext.Provider value={{ user, loading, setUser }}>
//       {children}
//     </UserContext.Provider>
//   );
// }
//
// export const useUser = (): UserContextType => {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error("useUser must be used within UserProvider");
//   }
//   return context;
// };






// "use client";
//
// import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
// import { useSession } from "next-auth/react";
//
// import { IUser } from "@/models/IUser";
// import { authService } from "@/lib/services/authService";
//
// type UserContextType = {
//   user: IUser | null;
//   loading: boolean;
//   setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
// };
//
// const UserContext = createContext<UserContextType | undefined>(undefined);
//
// export function UserProvider({ children }: { children: React.ReactNode }) {
//   const { data: session, status } = useSession();
//   const [user, setUser] = useState<IUser | null>(null);
//   const [loading, setLoading] = useState(true);
//
//   const fetchCurrentUser = useCallback(async () => {
//     if (!session?.user?.accessToken) return;
//
//     setLoading(true);
//
//     try {
//       const userData = await authService.getCurrentUser({accessToken: session.user.accessToken!});
//       setUser(userData);
//     } catch (error) {
//       setUser(null);
//       console.error("Failed to fetch current user:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [session]);
//
//
//   useEffect(() => {
//     (async () => {
//       if (status === "authenticated") {
//         await fetchCurrentUser();
//       } else if (status === "unauthenticated") {
//         setUser(null);
//         setLoading(false);
//       }
//     })();
//   }, [status, fetchCurrentUser]);
//
//   return (
//     <UserContext.Provider value={{ user, loading, setUser }}>
//       {children}
//     </UserContext.Provider>
//   );
// }
//
// export const useUser = (): UserContextType => {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error("useUser must be used within UserProvider");
//   }
//   return context;
// };

