import {urls, urls as paths} from "../constants/urls";
import {apiService} from "./apiService";
import {IVenue} from "@/models/IVenue";

type Token = { accessToken: string };

const venueService = {
    action: (id: string) => `${paths.venues}/${id}/`,

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
        return apiService(token?.accessToken).get(urls.venues.list, { params });
    },

    get: (id: string, token?: Token) => apiService(token?.accessToken).get<Ivenue>(urls.venues.action(id)),

    create: (data: Ivenue, token: Token) => apiService(token.accessToken).post<Ivenue>(urls.venues.create, data),

    update: (id: string, data: Partial<Ivenue>, token: Token) => apiService(token.accessToken).put<Ivenue>(urls.venues.action(id), data),

    delete: (id: string, token: Token) => apiService(token.accessToken).delete(urls.venues.action(id)),

    addPhoto: (venueId: string, formData: FormData, token: Token) =>
        apiService(token.accessToken).post(urls.venues.photos(venueId), formData, { withCredentials: true }),

    deletePhoto: (photoId: string, token: Token) => apiService(token.accessToken).delete(urls.venues.deletePhoto(photoId)),

    getExchangeRates: (token?: Token) => apiService(token?.accessToken).get(urls.venues.exchangeRates),

    getStats: (venueId: string, token?: Token) => apiService(token?.accessToken).get(urls.venues.stats(venueId)),

    getAveragePriceByRegion: (region: string, model?: string, token?: Token) => {
        const params = new URLSearchParams();
        params.append("region", region);
        if (model) params.append("model", model);
        const url = `${urls.venues.averagePriceRegion}?${params.toString()}`;
        return apiService(token?.accessToken).get(url);
    },

    getAveragePriceByCountry: (model?: string, token?: Token) => {
        const params = new URLSearchParams();
        if (model) params.append("model", model);
        const query = params.toString();
        const url = query
            ? `${urls.venues.averagePriceCountry}?${query}`
            : urls.venues.averagePriceCountry;
        return apiService(token?.accessToken).get(url);
    },

    getConstants: (token?: Token) => apiService(token?.accessToken).get(urls.venues.constants),
};

export default venueService;
