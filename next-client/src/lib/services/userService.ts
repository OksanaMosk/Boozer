import {apiService} from "./apiService";
import {urls} from "../constants/urls";
import {GetUserCarsResponse} from "@/models/ICar";
import {IUser} from "@/models/IUser";

const userService = {
    getAll: async (filterCriteria: {
        role?: string;
        is_active?: boolean;
        sort_by?: keyof IUser;
        sort_order?: 'asc' | 'desc';
    }, token: string): Promise<IUser[]> => {

        const response = await apiService.get(urls.users.list, {
            headers: token ? {Authorization: `Bearer ${token}`} : {},
        });

        console.log('Запит на /api/users/:', response);
        console.log('Заголовки запиту:', token ? {Authorization: `Bearer ${token}`} : {});

        const usersArray: IUser[] = Array.isArray(response.data.data) ? response.data.data : [];
        let filtered: IUser[] = usersArray;

        if (filterCriteria.role) {
            filtered = filtered.filter(user => user.role === filterCriteria.role);
        }

        if (filterCriteria.is_active !== undefined) {
            filtered = filtered.filter(user => user.is_active === filterCriteria.is_active);
        }

        if (filterCriteria.sort_by) {
            const key = filterCriteria.sort_by;
            filtered.sort((a: IUser, b: IUser) => {
                const fieldA = a[key];
                const fieldB = b[key];

                if (typeof fieldA === 'number' && typeof fieldB === 'number') {
                    return filterCriteria.sort_order === 'desc' ? fieldB - fieldA : fieldA - fieldB;
                }

                if (typeof fieldA === 'boolean' && typeof fieldB === 'boolean') {
                    return filterCriteria.sort_order === 'desc'
                        ? Number(fieldB) - Number(fieldA)
                        : Number(fieldA) - Number(fieldB);
                }

                const strA = String(fieldA);
                const strB = String(fieldB);

                if (strA < strB) return filterCriteria.sort_order === 'desc' ? 1 : -1;
                if (strA > strB) return filterCriteria.sort_order === 'desc' ? -1 : 1;
                return 0;
            });
        }
console.log(filtered)
        return filtered;
    },

    toggleActive: async (userId: string, isActive: boolean) => {
        const {data} = await apiService.patch(urls.users.active(userId), {
            is_active: isActive
        });
        return data;
    },


    changeRole: async (userId: string, role: string) => {
        const {data} = await apiService.patch(urls.users.changeRole(userId), {role});
        return data;
    },


    delete: async (userId: string) => {
        const {data} = await apiService.delete(urls.users.delete(userId));
        return data;
    },
    getUserCars(userId: string) {
        return apiService.get<GetUserCarsResponse>(urls.users.userCars(userId));
    },
};

export default userService
