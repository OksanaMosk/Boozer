export interface IUser {

  id?: number;
  email: string;
  token?: string;
  role: "visitor" | "venue_admin" | "admin";
  profile: {
    name: string;
    surname: string;
    phone: string;
    birth_date: string;
    is_rules_accepted: boolean;
  };
  is_active?: boolean;
}
