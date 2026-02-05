"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

import { IUser } from "@/models/IUser";
import { authService } from "@/lib/services/authService";

type UserContextType = {
  user: IUser | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    if (!session?.user?.accessToken) return;

    setLoading(true);

    try {
      const userData = await authService.getCurrentUser(session.user.accessToken);
      setUser(userData);
    } catch (error) {
      setUser(null);
      console.error("Failed to fetch current user:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);


  useEffect(() => {
    (async () => {
      if (status === "authenticated") {
        await fetchCurrentUser();
      } else if (status === "unauthenticated") {
        setUser(null);
        setLoading(false);
      }
    })();
  }, [status, fetchCurrentUser]);

  return (
    <UserContext.Provider value={{ user, loading, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};

//
//
//
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
//     if (status !== "authenticated") {
//       setUser(null);
//       setLoading(false);
//       return;
//     }
//
//     setLoading(true);
//
//     try {
//       const token = session?.user?.accessToken || "";
//       const userData = await authService.getCurrentUser(token);
//       setUser(userData);
//     } catch (error) {
//       setUser(null);
//       console.error("Failed to fetch current user:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [status, session]);
//
//   useEffect(() => {
//     (async () => {
//       await fetchCurrentUser();
//     })();
//   }, [fetchCurrentUser]);
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
