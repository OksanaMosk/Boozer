import React from "react";

export interface IUser {
  id?: string;
  email: string;
  token?: string;
  role: "visitor" | "venue_admin" | "admin";
  profile: {
    name: string;
    surname: string;
    phone: string;
    avatar?: string;
    birth_date: string;
    is_rules_accepted: boolean;
  };
  is_active?: boolean;
  managed_venue_ids?: number[];

}

export interface UserContextType {
  user: IUser | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
}
