import {urls, urls as paths} from "../constants/urls";
import {apiService} from "./apiService";
import {ICar} from "@/models/ICar";

type Token = { accessToken: string };

const carService = {
    action: (id: string) => `${paths.cars}/${id}/`,

    // GET-запити для перегляду — токен опційний
    getAll: (filterCriteria: {
        brand?: string;
        model?: string;
        condition?: string;
        year?: number;
        price?: number;
        location?: string;
        sort_by?: "year" | "price" | "location";
        sort_order?: "asc" | "desc";
    }, token?: Token) => {
        const params: Record<string, string | number | boolean> = {};
        if (filterCriteria.brand) params.brand = filterCriteria.brand;
        if (filterCriteria.model) params.model = filterCriteria.model;
        if (filterCriteria.condition) params.condition = filterCriteria.condition;
        if (filterCriteria.year) params.year = filterCriteria.year;
        if (filterCriteria.price) params.price = filterCriteria.price;
        if (filterCriteria.location) params.location = filterCriteria.location;
        if (filterCriteria.sort_by) {
            params.ordering =
                filterCriteria.sort_order === "desc"
                    ? `-${filterCriteria.sort_by}`
                    : filterCriteria.sort_by;
        }
        return apiService(token?.accessToken).get(urls.cars.list, { params });
    },

    get: (id: string, token?: Token) => apiService(token?.accessToken).get<ICar>(urls.cars.action(id)),

    create: (data: ICar, token: Token) => apiService(token.accessToken).post<ICar>(urls.cars.create, data),

    update: (id: string, data: Partial<ICar>, token: Token) => apiService(token.accessToken).put<ICar>(urls.cars.action(id), data),

    delete: (id: string, token: Token) => apiService(token.accessToken).delete(urls.cars.action(id)),

    addPhoto: (carId: string, formData: FormData, token: Token) =>
        apiService(token.accessToken).post(urls.cars.photos(carId), formData, { withCredentials: true }),

    deletePhoto: (photoId: string, token: Token) => apiService(token.accessToken).delete(urls.cars.deletePhoto(photoId)),

    getExchangeRates: (token?: Token) => apiService(token?.accessToken).get(urls.cars.exchangeRates),

    getStats: (carId: string, token?: Token) => apiService(token?.accessToken).get(urls.cars.stats(carId)),

    getAveragePriceByRegion: (region: string, model?: string, token?: Token) => {
        const params = new URLSearchParams();
        params.append("region", region);
        if (model) params.append("model", model);
        const url = `${urls.cars.averagePriceRegion}?${params.toString()}`;
        return apiService(token?.accessToken).get(url);
    },

    getAveragePriceByCountry: (model?: string, token?: Token) => {
        const params = new URLSearchParams();
        if (model) params.append("model", model);
        const query = params.toString();
        const url = query
            ? `${urls.cars.averagePriceCountry}?${query}`
            : urls.cars.averagePriceCountry;
        return apiService(token?.accessToken).get(url);
    },

    getConstants: (token?: Token) => apiService(token?.accessToken).get(urls.cars.constants),
};

export default carService;
