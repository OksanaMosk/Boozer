import {urls, urls as paths} from "../constants/urls";
import {apiService} from "./apiService";
import {ICar} from "@/models/ICar";

const carService = {
    action: (id: string) => `${paths.cars}/${id}/`,

    getAll: async (filterCriteria: {
        brand?: string;
        model?: string;
        condition?: string;
        year?: number;
        price?: number;
        location?: string;
        sort_by?: 'year' | 'price' | 'location';
        sort_order?: 'asc' | 'desc';
    }) => {
        const params: Record<string, string | number | boolean> = {};

        if (filterCriteria.brand) params.brand = filterCriteria.brand;
        if (filterCriteria.model) params.model = filterCriteria.model;
        if (filterCriteria.condition) params.condition = filterCriteria.condition;
        if (filterCriteria.year) params.year = filterCriteria.year;
        if (filterCriteria.price) params.price = filterCriteria.price;
        if (filterCriteria.location) params.location = filterCriteria.location;

        if (filterCriteria.sort_by) {
            params.ordering =
                filterCriteria.sort_order === 'desc'
                    ? `-${filterCriteria.sort_by}`
                    : filterCriteria.sort_by;
        }

        const {data} = await apiService.get(urls.cars.list, {params});
        return data;
    },

    get(id: string) {
        return apiService.get<ICar>(urls.cars.action(id));
    },

    create(data: ICar) {
        return apiService.post<ICar>(urls.cars.create, data);
    },

    update(id: string, data: Partial<ICar>) {
        return apiService.put<ICar>(urls.cars.action(id), data);
    },

    delete(id: string) {
        return apiService.delete(urls.cars.action(id));
    },

    addPhoto(carId: string, formData: FormData) {
        return apiService.post(urls.cars.photos(carId), formData, {
            withCredentials: true,
        });
    },
    deletePhoto(photoId: string) {
        return apiService.delete(urls.cars.deletePhoto(photoId));
    },

    getExchangeRates() {
        return apiService.get(urls.cars.exchangeRates);
    },

    getStats(carId: string) {
        const url = urls.cars.stats(carId);
        return apiService.get(url);
    },

    getAveragePriceByRegion: (region: string, model?: string) => {
        const params = new URLSearchParams();
        params.append("region", region);

        if (model) {
            params.append("model", model);
        }

        const query = params.toString();
        const url = `${urls.cars.averagePriceRegion}?${query}`;
        return apiService.get(url);
    },

    getAveragePriceByCountry: (model?: string) => {
        const params = new URLSearchParams();

        if (model) {
            params.append("model", model);
        }

        const query = params.toString();
        const url = query
            ? `${urls.cars.averagePriceCountry}?${query}`
            : urls.cars.averagePriceCountry;
        return apiService.get(url);
    },

    getConstants() {
        return apiService.get(urls.cars.constants);
    },
};

export {carService};
