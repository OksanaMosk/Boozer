import { IUser } from "@/models/IUser";

export const mapSessionToUser = (sessionUser: any, defaultRole: string = "buyer"): IUser => ({
    id: sessionUser.id ? (sessionUser.id) : "",
    email: sessionUser.email || "",
    role: (sessionUser.role as IUser["role"]) || (defaultRole as IUser["role"]),
    profile: {
        name: sessionUser.name?.split(" ")[0] || "",
        surname: sessionUser.name?.split(" ")[1] || "",
        birth_date: sessionUser.birth_date || null, // значення за замовчуванням
        phone: sessionUser.phone || "",
        is_rules_accepted: false,
    },
});