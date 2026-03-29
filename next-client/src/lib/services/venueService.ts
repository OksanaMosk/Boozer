import {urls} from "../constants/urls";
import {apiService} from "./apiService";
import {
    IVenue,
    IVenuePhoto,
    IMenu,
    IMenuItem,
    IReview,
    INews,
    // IVenueTag,
    PaginatedResponse, ITable,
    INewsPhoto, IExtraService
} from "@/models/IVenue";
// import {IUser} from "@/models/IUser";
import {IOrder, ITableBooking, OrderStatusType} from "@/models/IOrder";
import {ITravelEstimate, ITravelLogistics} from "@/models/ITravel";
import {IFavoriteCollection} from "@/models/IReviewFeedback";

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
    if (criteria.tags) {
        const tagValue = Array.isArray(criteria.tags)
            ? criteria.tags.join(",")
            : criteria.tags;
        if (tagValue.length > 0) {
            params.tags__name = tagValue;
        }
    }

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
    user?:string;
}

const buildReviewParams = (criteria?: ReviewFilterCriteria) => {
    const params: Record<string, string> = {};
    if (criteria?.venue) params.venue = criteria.venue;
    if (criteria?.user) params.user = criteria.user;
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
            get: (tableId: string) => api(token).get<ITable>(`${urls.venues.tables(venueId)}${tableId}/`),
            create: (data: Partial<ITable>) => api(token).post<ITable>(urls.venues.tables(venueId), data),
            update: (tableId: string, data: Partial<ITable>) => api(token).patch<ITable>(`${urls.venues.tables(venueId)}${tableId}/`, data),
            delete: (tableId: string) => api(token).delete(`${urls.venues.tables(venueId)}${tableId}/`)
        }),
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
            getAllByVenue: (params: { lower: string; upper: string }) => api(token).get<ITableBooking[]>(`${urls.venues.list}${venueId}/bookings/`, {params}),
            bulkCreate: (data: { order: number; tables: number[]; time_range: any }) => api(token).post(`${urls.venues.list}${venueId}/bookings/bulk-create/`, data)
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
                getAll: () => getByParent<INewsPhoto>((id: string) => urls.venues.newsImages(venueId, id), token)(newsId),
                get: (imageId: string) => api(token).get<INewsPhoto>(`${urls.venues.newsImages(venueId, newsId)}${imageId}/`),
                create: (formData: FormData) => api(token).post<INewsPhoto>(urls.venues.newsImages(venueId, newsId), formData, {headers: {"Content-Type": "multipart/form-data"}}),
                update: (imageId: string, data: Partial<INewsPhoto>) => api(token).patch<INewsPhoto>(`${urls.venues.newsImages(venueId, newsId)}${imageId}/`, data),
                delete: (imageId: string) => api(token).delete(`${urls.venues.newsImages(venueId, newsId)}${imageId}/`),
            }),
        }),
        travelLogistics: (token?: Token) => (venueId: string) => ({
            getAll: () => api(token).get<ITravelLogistics[]>(urls.venues.travelLogistics(venueId)),
            updatePrices: (data: { step_type: string; price_per_km: number }[]) => api(token).post<ITravelLogistics[]>(`${urls.venues.travelLogistics(venueId)}update-prices/`, data),
            calculate: (lat: number, lng: number, start?: string, end?: string) => api(token).get<ITravelEstimate>(`${urls.venues.travelLogistics(venueId)}calculate/`, {params: {lat, lng, start, end}}),
            get: (id: string) => api(token).get<ITravelLogistics>(`${urls.venues.travelLogistics(venueId)}${id}/`),
            create: (data: Partial<ITravelLogistics>) => api(token).post<ITravelLogistics>(urls.venues.travelLogistics(venueId), data),
            update: (id: string, data: Partial<ITravelLogistics>) => api(token).patch<ITravelLogistics>(`${urls.venues.travelLogistics(venueId)}${id}/`, data),
            delete: (id: string) => api(token).delete(`${urls.venues.travelLogistics(venueId)}${id}/`),
        }),
        extraServices: (token?: Token) => (venueId: string) => ({
            getAll: () => api(token).get<IExtraService[]>(urls.venues.extraServices(venueId)),
            updatePrices: (data: {
                service_type: string;
                price: number;
                price_type: string;
                name: string
            }[]) => api(token).post<IExtraService[]>(`${urls.venues.extraServices(venueId)}update-prices/`, data),
            get: (id: string) => api(token).get<IExtraService>(`${urls.venues.extraServices(venueId)}${id}/`),
            create: (data: Partial<IExtraService>) => api(token).post<IExtraService>(urls.venues.extraServices(venueId), data),
            update: (id: string, data: Partial<IExtraService>) => api(token).patch<IExtraService>(`${urls.venues.extraServices(venueId)}${id}/`, data),
            delete: (id: string) => api(token).delete(`${urls.venues.extraServices(venueId)}${id}/`),
        }),
        reviews: (token?: Token) => (venueId: string) => ({
            getAll: (params?: any) => api(token).get<PaginatedResponse<IReview>>(urls.venues.reviews.list(venueId), {params}),
            get: (id: string | number) => api(token).get<IReview>(urls.venues.reviews.detail(venueId, id.toString())),
            create: (data: Partial<IReview> | FormData) => api(token).post<IReview>(urls.venues.reviews.create(venueId), data, {headers: data instanceof FormData ? {"Content-Type": "multipart/form-data"} : {}}),
            update: (id: string | number, data: Partial<IReview> | FormData) => api(token).patch<IReview>(urls.venues.reviews.update(venueId, id.toString()), data, {headers: data instanceof FormData ? {"Content-Type": "multipart/form-data"} : {}}),
            delete: (id: string | number) => api(token).delete(urls.venues.reviews.delete(venueId, id.toString())),
            like: (id: string | number) => api(token).post(`${urls.venues.reviews.detail(venueId, id.toString())}like/`),
            report: (id: string | number, data: { reason: string; comment?: string }) => api(token).post(`${urls.venues.reviews.detail(venueId, id.toString())}report/`, data),
        }),
        favorites: (token?: Token) => (venueId: string) => ({
            add: (data: { collection_id?: number; new_collection_name?: string; collection_category?: string }) => api(token).post(urls.venues.favorites(venueId), data),
            getAll: (criteria?: FavoriteFilterCriteria) => api(token).get(urls.venues.favorites(venueId), {params: buildFavoriteParams(criteria || {venueId})}),
            delete: () => api(token).delete(`${urls.venues.favorites(venueId)}delete_favorite/`),
        }),
        tags: (venueId: string) => ({
            ...createService<{ name: string }>(urls.venues.tags.list(venueId)),
        }),
        orders: (token?: Token) => (venueId: string) => ({
            getAll: (filterCriteria?: OrderFilterCriteria & {
                page?: number
            }) => api(token).get<PaginatedResponse<IOrder>>(urls.venues.orders(venueId), {params: buildOrderParams(filterCriteria)}),
            get: (orderId: string | number) => api(token).get<IOrder>(`${urls.venues.orders(venueId)}${orderId}/`),
            create: (data: Partial<IOrder>) => api(token).post<IOrder>(urls.venues.orders(venueId), data),
            update: (orderId: string | number, data: Partial<IOrder>) => api(token).patch<IOrder>(`${urls.venues.orders(venueId)}${orderId}/`, data),
            updateStatus: (orderId: string | number, status: OrderStatusType) => api(token).patch<IOrder>(`${urls.venues.orders(venueId)}${orderId}/`, {status}),
            delete: (orderId: string | number) => api(token).delete(`${urls.venues.orders(venueId)}${orderId}/`),}),
    },
    venuePhotos: (token?: Token) => ({
        list: getByParent<IVenuePhoto>(urls.venues.photos, token),
        get: (venueId: string, photoId: string) => api(token).get<IVenuePhoto>(`${urls.venues.photos(venueId)}/${photoId}/`),
        create: (venueId: string, formData: FormData) => api(token).post<IVenuePhoto>(urls.venues.photos(venueId), formData, {headers: {"Content-Type": "multipart/form-data"},}),
        update: (venueId: string, photoId: string, data: Partial<IVenuePhoto>) => api(token).patch<IVenuePhoto>(`${urls.venues.photos(venueId)}${photoId}/`, data),
        delete: (venueId: string, photoId: string) => api(token).delete(`${urls.venues.photos(venueId)}${photoId}/`),
    }),

    allNews: {
        list: (params?: { page?: number; limit?: number; type?: string; status?: string; is_pinned?: boolean; }, token?: Token) => api(token).get<PaginatedResponse<INews>>(urls.allNews.list, {params}),
        get: (newsId: string | number, token?: Token) => api(token).get<INews>(`${urls.allNews.detail}${newsId}/`),
    },

    bookings: {
        ...createService<IOrder>(urls.bookings.list),
        byTable: getByParent<IOrder>(urls.bookings.byTable),
        active: (token?: Token) => api(token).get<IOrder[]>(urls.bookings.active),
    },

    reviews: {
        getAllWithFilter: (filterCriteria?: ReviewFilterCriteria, token?: Token) =>
            api(token).get<IReview[]>(urls.reviews.list, {params: buildReviewParams(filterCriteria)}),
        ...createService<IReview>(urls.reviews.list),
        like: (reviewId: string | number, token?: Token) => api(token).post(urls.reviews.like(reviewId)),
        report: (reviewId: string | number, data: { reason: string; comment?: string }, token?: Token) => api(token).post(urls.reviews.report(reviewId), data),
    },

    collections: (token?: Token) => ({
        getAll: (params?: any) => api(token).get<PaginatedResponse<IFavoriteCollection>>(urls.collections.list, {params}),
        get: (id: string | number) => api(token).get<IFavoriteCollection>(urls.collections.detail(id)),
        create: (data: {
            name: string;
            category: string;
            is_staff_top?: boolean
        }) => api(token).post(urls.collections.list, data),
        delete: (id: string | number) => api(token).delete(urls.collections.detail(id)),
        reorderItems: (id: string | number, items: any[]) => api(token).patch(`${urls.collections.detail(id.toString())}reorder/`, items),
    }),

    favorites: {
        list: (token?: Token) => api(token).get<any>(urls.favorites.list),
        detail: (id: string | number, token?: Token) => api(token).get<any>(urls.favorites.detail(id)),
        getCandidates: (category: string, token?: Token) => api(token).get(`${urls.favorites.list}candidates/`, { params: { category } }),
    },
    constants: {
        getConstants: () => api().get(urls.constants.constantsList),
    },

    stats: {
        getStats: (venueId: string, token?: Token) => api(token).get(urls.venues.stats(venueId)),
    },
    exchangeService: {
        getRates: (token?: Token) => api(token).get<{ USD: number; EUR: number }>(urls.exchangeRates),
    }
};

export default venueServices;
