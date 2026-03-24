"use client";

import React, { useContext, useEffect, useState, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { IUser, UserContextType } from "@/models/IUser";
import {usePathname, useRouter} from "next/navigation";

const UserContext = React.createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

    useEffect(() => {
  if (status === "loading") return;
  if (session?.user?.error === "RefreshAccessTokenError") {
    void signOut({redirectTo: "/login" });
    return;
  }
  if (status === "authenticated" && session?.user) {
    const mappedUser: IUser = {
      id: String(session.user.id),
      email: session.user.email || "",
      token: session.user.accessToken || "",
      role: (session.user.role || "visitor") as "visitor" | "venue_admin" | "admin",
      profile: {
        name: session.user.profile?.name || session.user.name || "",
        surname: session.user.profile?.surname || "",
        phone: session.user.profile?.phone || "",
        birth_date: session.user.profile?.birth_date || "",
        is_rules_accepted: session.user.profile?.is_rules_accepted || false,
          avatar: session.user.profile?.avatar || "",
      },
    };
    setUser(prevUser => {
      if (JSON.stringify(prevUser) !== JSON.stringify(mappedUser)) {
        return mappedUser;
      }
      return prevUser;
    });
    setLoading(false);
  } else if (status === "unauthenticated") {
    setUser(null);
    setLoading(false);
  }
}, [status, session]);

  //   useEffect(() => {
  //   const publicPages = ["/login", "/register", "/welcome"];
  //   const isPublic = publicPages.includes(pathname);
  //
  //   if (!loading && !user?.token && !isPublic) {
  //     router.replace("/login");
  //   }
  // }, [user, loading, pathname, router]);



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
