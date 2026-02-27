import {urls} from "../constants/urls";
import {apiService} from "./apiService";
import {
    IVenue,
    IVenuePhoto,
    ITableBooking,
    IMenu,
    IMenuItem,
    IOrder,
    IReview,
    INews,
    IVenueTag,
    PaginatedResponse, ITable
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
            getBackground: () =>
                api(token).get<{ url: string }>(
                    `${urls.venues.list}${venueId}/tables_layout/get_background/`
                ),
            uploadBackground: (url: string) => {
                return api(token).post<{ url: string }>(
                    `${urls.venues.list}${venueId}/tables_layout/upload_background/`,
                    {url}
                );
            },

        }),
//         background: (token?: Token) => (venueId: string) => ({
//             getBackground: () =>
//                 api(token).get<{ url: string }>(`${urls.venues.list}${venueId}/tables_layout/get_background/`),
//
//             uploadBackground: (file: File) => {
//                 const formData = new FormData();
//                 formData.append('background', file);
//                 return api(token).post<{ url: string }>(
//                     `${urls.venues.list}${venueId}/tables_layout/upload_background/`,
//                     formData,
//                     {headers: {"Content-Type": "multipart/form-data"}}
//                 );
//             },
//         }),

        bookings: (token?: Token) => (venueId: string) => (tableId: string) => ({
            getAll: () => api(token).get<PaginatedResponse<IOrder[]>>(urls.venues.bookings(venueId, tableId)),
            get: (bookingId: string) => api(token).get<IOrder>(`${urls.venues.bookings(venueId, tableId)}${bookingId}/`),
            create: (data: Partial<IOrder>) => api(token).post<IOrder>(urls.venues.bookings(venueId, tableId), data),
            update: (bookingId: string, data: Partial<IOrder>) => api(token).patch<IOrder>(`${urls.venues.bookings(venueId, tableId)}${bookingId}/`, data),
            delete: (bookingId: string) => api(token).delete(`${urls.venues.bookings(venueId, tableId)}${bookingId}/`),
        }),


        menu: (token?: Token) => (venueId: string) => ({
            getAll: () => getByParent<PaginatedResponse<IMenu>>(urls.venues.menu, token)(venueId),
            get: (menuId: string) =>
                api(token).get<IMenu>(`${urls.venues.menu(venueId)}${menuId}/`),
            create: (data: Partial<IMenu>) =>
                api(token).post<IMenu>(urls.venues.menu(venueId), data),
            update: (menuId: string, data: Partial<IMenu>) =>
                api(token).patch<IMenu>(`${urls.venues.menu(venueId)}${menuId}/`, data),
            delete: (menuId: string) =>
                api(token).delete(`${urls.venues.menu(venueId)}${menuId}/`),
        }),

        menuItems: (token?: Token) => (venueId: string) => (menuId: string) => ({
            getAll: () =>
                getByParent<IMenuItem>((id: string) => urls.venues.menuItems(venueId, id), token)(menuId),
            create: (data: Partial<IMenuItem>) => api(token).post<IMenuItem>(urls.venues.menuItems(venueId, menuId), data),
            update: (menuItemId: string, data: Partial<IMenuItem>) => api(token).patch<IMenuItem>(`${urls.venues.menuItems(venueId, menuId)}${menuItemId}/`, data),
            delete: (menuItemId: string) => api(token).delete(`${urls.venues.menuItems(venueId, menuId)}${menuItemId}/`),
            reorder: (data: { id: string; position: number }[]) =>
                api(token).patch(`${urls.venues.menuItems(venueId, menuId)}reorder/`, data),

        }),

        news: getByParent<INews>(urls.venues.news),
        reviews: {
            getAllWithFilter: (filterCriteria?: ReviewFilterCriteria, token?: Token) =>
                api(token).get<IReview[]>(urls.reviews.list, {params: buildReviewParams(filterCriteria)}),
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
                create: (data: Partial<IVenueTag>) =>
                    api(token).post<IVenueTag>(urls.venues.venueTags.create(venueId), data),
                get: (tagId: string) =>
                    api(token).get<IVenueTag>(urls.venues.venueTags.detail(venueId, tagId)),
                update: (tagId: string, data: Partial<IVenueTag>) =>
                    api(token).patch<IVenueTag>(urls.venues.venueTags.update(venueId, tagId), data),
                delete: (tagId: string) =>
                    api(token).delete(urls.venues.venueTags.delete(venueId, tagId)),
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

        // orders: {
        //     getAllWithFilter: (filterCriteria?: OrderFilterCriteria, token?: Token) =>
        //         api(token).get<IOrder[]>(urls.bookings.list, { params: buildOrderParams(filterCriteria) }),
        //     ...createService<IOrder>(urls.bookings.list),
        //     byTable: getByParent<IOrder>(urls.bookings.byTable),
        //     active: (token?: Token) => api(token).get<IOrder[]>(urls.bookings.active),
        // },
    },
    venuePhotos: (token?: Token) => ({
        list: getByParent<IVenuePhoto>(urls.venues.photos, token),
        get: (venueId: string, photoId: string) =>
            api(token).get<IVenuePhoto>(`${urls.venues.photos(venueId)}/${photoId}/`),
        create: (venueId: string, formData: FormData) =>
            api(token).post<IVenuePhoto>(urls.venues.photos(venueId), formData, {
                headers: {"Content-Type": "multipart/form-data"},
            }),
        update: (venueId: string, photoId: string, data: Partial<IVenuePhoto>) =>
            api(token).patch<IVenuePhoto>(`${urls.venues.photos(venueId)}${photoId}/`, data),
        delete: (venueId: string, photoId: string) =>
            api(token).delete(`${urls.venues.photos(venueId)}${photoId}/`),
    }),

    // tables: {
    //     ...createService<ITableBooking>(urls.tables.list),
    //     byVenue: getByParent<ITableBooking>(urls.tables.byVenue),
    //     activeByVenue: getByParent<ITableBooking>(urls.tables.activeByVenue),
    //     // bookings: getByParent<IOrder>(urls.tables.bookings),
    // },
    // bookings: {
    //     ...createService<IOrder>(urls.bookings.list),
    //     byTable: getByParent<IOrder>(urls.bookings.byTable),
    //     active: (token?: Token) => api(token).get<IOrder[]>(urls.bookings.active),
    // },

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


// const venues = await apiServices.venues.getAll(token);
// const photos = await apiServices.venuePhotos.byVenue(venueId);
// const tables = await apiServices.tables.byVenue(venueId);