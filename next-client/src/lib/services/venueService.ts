import {urls} from "../constants/urls";
import {apiService} from "./apiService";
import {
    IVenue,
    IVenuePhoto,
    IMenu,
    IMenuItem,
    IOrder,
    IReview,
    INews,
    IVenueTag,
    PaginatedResponse, ITable,
    INewsPhoto, ITravelLogistics, ITravelEstimate, IExtraService, OrderStatus, ITableBooking
} from "@/models/IVenue";
import {IUser} from "@/models/IUser";

type Token = { accessToken: string };

const api = (token?: Token) => apiService(token?.accessToken);

const createService = <T>(baseUrl: string) => ({
    getAll: (token?: Token) => api(token).get<PaginatedResponse<T>>(baseUrl),
    get: (id: string, token?: Token) => api(token).get<T>(`${baseUrl}${id}/`),
    create: (data: Partial<T>, token?: Token) => api(token).post<T>(baseUrl, data),
    update: (id: string, data: Partial<T>, token?: Token) => api(token).patch<T>(`${baseUrl}${id}/`, data),
    delete: (id: string, token?: Token) => api(token).delete(`${baseUrl}${id}/`),
});

const getByParent = <T>(endpoint: (parentId: string) => string, token?: Token) =>
    (parentId: string) => api(token).get<T>(endpoint(parentId));

export interface VenueFilterCriteria {
    name?: string;
    country?: string;
    city?: string;
    rating_min?: number;
    rating_max?: number;
    reviews_count_min?: number;
    reviews_count_max?: number;
    tags?: string[];
    sort_by?: "average_check" | "rating" | "reviews_count" | "views";
    sort_order?: "asc" | "desc";
}

const buildVenueParams = (criteria?: VenueFilterCriteria & { page?: number }) => {
    const params: Record<string, string | number | boolean> = {};
    if (!criteria) return params;
    if (criteria.name) params.name = criteria.name;
    if (criteria.country) params.country = criteria.country;
    if (criteria.city) params.city = criteria.city;
    if (criteria.rating_min !== undefined) params.rating_min = criteria.rating_min;
    if (criteria.rating_max !== undefined) params.rating_max = criteria.rating_max;
    if (criteria.reviews_count_min !== undefined) params.reviews_count_min = criteria.reviews_count_min;
    if (criteria.reviews_count_max !== undefined) params.reviews_count_max = criteria.reviews_count_max;
    if (criteria.tags?.length) params.tags = criteria.tags.join(",");
    if (criteria.sort_by) {
        params.ordering = criteria.sort_order === "desc" ? `-${criteria.sort_by}` : criteria.sort_by;
    }
    if (criteria.page) params.page = criteria.page;
    return params;
};

export interface OrderFilterCriteria {
    status?: string;
    currency?: string;
    user?: string;
    venue?: string;
    start_date?: string;
    end_date?: string;
}

const buildOrderParams = (criteria?: OrderFilterCriteria) => {
    const params: Record<string, string | number | boolean> = {};
    if (!criteria) return params;
    if (criteria.status) params.status = criteria.status;
    if (criteria.currency) params.currency = criteria.currency;
    if (criteria.user) params.user = criteria.user;
    if (criteria.venue) params.venue = criteria.venue;
    if (criteria.start_date) params.start_date = criteria.start_date;
    if (criteria.end_date) params.end_date = criteria.end_date;
    return params;
};

export interface ReviewFilterCriteria {
    venue?: string;
}

const buildReviewParams = (criteria?: ReviewFilterCriteria) => {
    const params: Record<string, string> = {};
    if (criteria?.venue) params.venue = criteria.venue;
    return params;
};

export interface FavoriteFilterCriteria {
    venueId?: string;
}

const buildFavoriteParams = (criteria?: FavoriteFilterCriteria) => {
    const params: Record<string, string> = {};
    if (criteria?.venueId) params.venue = criteria.venueId;
    return params;
};


const venueServices = {
    venues: {
        getAllWithFilter: (filterCriteria?: VenueFilterCriteria, token?: Token) =>
            api(token).get<PaginatedResponse<IVenue>>(urls.venues.list, {params: buildVenueParams(filterCriteria)}),
        ...createService<IVenue>(urls.venues.list),
        photos: getByParent<IVenuePhoto>(urls.venues.photos),
        tables: (token?: Token) => (venueId: string) => ({
            getAll: () => getByParent<ITable>(urls.venues.tables, token)(venueId),
            get: (tableId: string) =>
                api(token).get<ITable>(`${urls.venues.tables(venueId)}${tableId}/`),
            create: (data: Partial<ITable>) =>
                api(token).post<ITable>(urls.venues.tables(venueId), data),
            update: (tableId: string, data: Partial<ITable>) =>
                api(token).patch<ITable>(`${urls.venues.tables(venueId)}${tableId}/`, data),
            delete: (tableId: string) =>
                api(token).delete(`${urls.venues.tables(venueId)}${tableId}/`)
        }),
// venueServices.venues.bookings(token)(venueId)(tableId).getAll()
        background: (token?: Token) => (venueId: string) => ({
            getBackground: () => api(token).get<{
                url: string
            }>(`${urls.venues.list}${venueId}/tables_layout/get_background/`),
            uploadBackground: (url: string) => {
                return api(token).post<{
                    url: string
                }>(`${urls.venues.list}${venueId}/tables_layout/upload_background/`, {url});
            },
        }),
        bookings: (token?: Token) => (venueId: string) => (tableId: string) => ({
            getAll: () => api(token).get<ITableBooking[]>(urls.venues.bookings(venueId, tableId)),
            get: (bookingId: string) => api(token).get<ITableBooking>(`${urls.venues.bookings(venueId, tableId)}${bookingId}/`),
            create: (data: ITableBooking) => api(token).post<ITableBooking>(urls.venues.bookings(venueId, tableId), data),
            update: (bookingId: string, data: Partial<ITableBooking>) => api(token).patch<ITableBooking>(`${urls.venues.bookings(venueId, tableId)}${bookingId}/`, data),
            delete: (bookingId: string | number) => api(token).delete(`${urls.venues.bookings(venueId, tableId)}${bookingId}/`),
        }),
        menu: (token?: Token) => (venueId: string) => ({
            getAll: () => getByParent<PaginatedResponse<IMenu>>(urls.venues.menu, token)(venueId),
            get: (menuId: string) => api(token).get<IMenu>(`${urls.venues.menu(venueId)}${menuId}/`),
            create: (data: Partial<IMenu>) => api(token).post<IMenu>(urls.venues.menu(venueId), data),
            update: (menuId: string, data: Partial<IMenu>) => api(token).patch<IMenu>(`${urls.venues.menu(venueId)}${menuId}/`, data),
            delete: (menuId: string) => api(token).delete(`${urls.venues.menu(venueId)}${menuId}/`),
        }),
        menuItems: (token?: Token) => (venueId: string) => (menuId: string) => ({
            getAll: () => getByParent<IMenuItem>((id: string) => urls.venues.menuItems(venueId, id), token)(menuId),
            create: (data: Partial<IMenuItem>) => api(token).post<IMenuItem>(urls.venues.menuItems(venueId, menuId), data),
            update: (menuItemId: string, data: Partial<IMenuItem>) => api(token).patch<IMenuItem>(`${urls.venues.menuItems(venueId, menuId)}${menuItemId}/`, data),
            delete: (menuItemId: string) => api(token).delete(`${urls.venues.menuItems(venueId, menuId)}${menuItemId}/`),
            reorder: (data: { id: string; position: number }[]) => api(token).patch(`${urls.venues.menuItems(venueId, menuId)}reorder/`, data),

        }),
        news: (token?: Token) => (venueId: string) => ({
            getAll: (params?: any) => api(token).get<PaginatedResponse<INews>>(urls.venues.news(venueId), {params}),
            get: (newsId: string) => api(token).get<INews>(`${urls.venues.news(venueId)}${newsId}/`),
            create: (data: Partial<INews>) => api(token).post<INews>(urls.venues.news(venueId), data),
            update: (newsId: string, data: Partial<INews>) => api(token).patch<INews>(`${urls.venues.news(venueId)}${newsId}/`, data),
            delete: (newsId: string) => api(token).delete(`${urls.venues.news(venueId)}${newsId}/`),
            images: (newsId: string) => ({
                getAll: () => getByParent<INewsPhoto>((id: string) => urls.venues.newsImages(venueId, id), token)(newsId), get: (imageId: string) => api(token).get<INewsPhoto>(`${urls.venues.newsImages(venueId, newsId)}${imageId}/`),
                create: (formData: FormData) => api(token).post<INewsPhoto>(urls.venues.newsImages(venueId, newsId), formData, { headers: { "Content-Type": "multipart/form-data" } }),
                update: (imageId: string, data: Partial<INewsPhoto>) => api(token).patch<INewsPhoto>(`${urls.venues.newsImages(venueId, newsId)}${imageId}/`, data),
                delete: (imageId: string) => api(token).delete(`${urls.venues.newsImages(venueId, newsId)}${imageId}/`),
            }),
        }),
        travelLogistics: (token?: Token) => (venueId: string) => ({
                getAll: () => api(token).get<ITravelLogistics[]>(urls.venues.travelLogistics(venueId)),
                updatePrices: (data: { step_type: string; price_per_km: number }[]) => api(token).post<ITravelLogistics[]>(`${urls.venues.travelLogistics(venueId)}update-prices/`, data),
                calculate: (lat: number, lng: number, start?: string, end?: string) => api(token).get<ITravelEstimate>(`${urls.venues.travelLogistics(venueId)}calculate/`, {params: { lat, lng, start, end }}),
                get: (id: string) => api(token).get<ITravelLogistics>(`${urls.venues.travelLogistics(venueId)}${id}/`),
                create: (data: Partial<ITravelLogistics>) => api(token).post<ITravelLogistics>(urls.venues.travelLogistics(venueId), data),
                update: (id: string, data: Partial<ITravelLogistics>) => api(token).patch<ITravelLogistics>(`${urls.venues.travelLogistics(venueId)}${id}/`, data),
                delete: (id: string) => api(token).delete(`${urls.venues.travelLogistics(venueId)}${id}/`),
            }),
        extraServices: (token?: Token) => (venueId: string) => ({
                getAll: () => api(token).get<IExtraService[]>(urls.venues.extraServices(venueId)),
                updatePrices: (data: { service_type: string; price: number; price_type: string; name: string }[]) =>api(token).post<IExtraService[]>(`${urls.venues.extraServices(venueId)}update-prices/`, data),
                get: (id: string) => api(token).get<IExtraService>(`${urls.venues.extraServices(venueId)}${id}/`),
                create: (data: Partial<IExtraService>) => api(token).post<IExtraService>(urls.venues.extraServices(venueId), data),
                update: (id: string, data: Partial<IExtraService>) => api(token).patch<IExtraService>(`${urls.venues.extraServices(venueId)}${id}/`, data),
                delete: (id: string) => api(token).delete(`${urls.venues.extraServices(venueId)}${id}/`),
}),
        reviews: {
            getAllWithFilter: (filterCriteria?: ReviewFilterCriteria, token?: Token) => api(token).get<IReview[]>(urls.reviews.list, {params: buildReviewParams(filterCriteria)}),
            ...createService<IReview>(urls.reviews.list),
            favoritesList: (token?: Token) => api(token).get<IReview[]>(urls.reviews.favoritesList),
            favoritesDetail: (id: string, token?: Token) => api(token).get<IReview>(urls.reviews.favoritesDetail(id)),
        },
        favorites: {
            getAll: (filterCriteria?: FavoriteFilterCriteria, token?: Token) => {
                if (!filterCriteria?.venueId) throw new Error("venueId is required for favorites");
                return api(token).get<IUser[]>(urls.venues.favorites(filterCriteria.venueId), {
                    params: buildFavoriteParams(filterCriteria),
                });
            },
        },
        tags: (venueId: string) => ({
            ...createService<{ name: string }>(urls.venues.tags.list(venueId)),
        }),

        venueTags: (token?: Token) =>
            (venueId: string) => ({
                getAll: () => getByParent<IVenueTag>(urls.venues.venueTags.list, token)(venueId),
                create: (data: Partial<IVenueTag>) => api(token).post<IVenueTag>(urls.venues.venueTags.create(venueId), data),
                get: (tagId: string) => api(token).get<IVenueTag>(urls.venues.venueTags.detail(venueId, tagId)),
                update: (tagId: string, data: Partial<IVenueTag>) => api(token).patch<IVenueTag>(urls.venues.venueTags.update(venueId, tagId), data),
                delete: (tagId: string) => api(token).delete(urls.venues.venueTags.delete(venueId, tagId)),
            }),


        // venueTags: {
        //     create: (venueId: string, data: Partial<IVenueTag>, token?: Token) =>
        //         api(token).post<IVenueTag>(`/venues/${venueId}/venue_tags/`, data),
        //
        //     getAll: (venueId: string, token?: Token) =>
        //         api(token).get<IVenueTag[]>(`/venues/${venueId}/venue_tags/`),
        //
        //     delete: (venueId: string, tagId: string, token?: Token) =>
        //         api(token).delete(`/venues/${venueId}/venue_tags/${tagId}/`),
        // },

         orders: (token?: Token) => (venueId: string) => ({
            getAll: (filterCriteria?: OrderFilterCriteria & { page?: number }) => api(token).get<PaginatedResponse<IOrder>>(urls.venues.orders(venueId), {params: buildOrderParams(filterCriteria)}),
            get: (orderId: string | number) => api(token).get<IOrder>(`${urls.venues.orders(venueId)}${orderId}/`),
            create: (data: Partial<IOrder>) => api(token).post<IOrder>(urls.venues.orders(venueId), data),
            update: (orderId: string | number, data: Partial<IOrder>) => api(token).patch<IOrder>(`${urls.venues.orders(venueId)}${orderId}/`, data),
            updateStatus: (orderId: string | number, status: OrderStatus) => api(token).patch<IOrder>(`${urls.venues.orders(venueId)}${orderId}/`, { status }),
            delete: (orderId: string | number) => api(token).delete(`${urls.venues.orders(venueId)}${orderId}/`),
            getActive: () => api(token).get<IOrder[]>(`${urls.venues.orders(venueId)}active/`),
        }),
    },
    venuePhotos: (token?: Token) => ({
        list: getByParent<IVenuePhoto>(urls.venues.photos, token),
        get: (venueId: string, photoId: string) => api(token).get<IVenuePhoto>(`${urls.venues.photos(venueId)}/${photoId}/`),
        create: (venueId: string, formData: FormData) => api(token).post<IVenuePhoto>(urls.venues.photos(venueId), formData, {headers: {"Content-Type": "multipart/form-data"},}),
        update: (venueId: string, photoId: string, data: Partial<IVenuePhoto>) => api(token).patch<IVenuePhoto>(`${urls.venues.photos(venueId)}${photoId}/`, data),
        delete: (venueId: string, photoId: string) => api(token).delete(`${urls.venues.photos(venueId)}${photoId}/`),
    }),

    bookings: {
        ...createService<IOrder>(urls.bookings.list),
        byTable: getByParent<IOrder>(urls.bookings.byTable),
        active: (token?: Token) => api(token).get<IOrder[]>(urls.bookings.active),
    },

    reviews: {
        ...createService<IReview>(urls.reviews.list),
    },

    constants: {
        getConstants: (token?: Token) => api(token).get(urls.constants.constantsList),
    },
    stats: {
       getStats: (venueId: string, token?: Token) => api(token).get (urls.venues.stats(venueId)),
    },
};

export default venueServices;
