const paths = {
    auth: "/auth",
    venues: "/venues",
    users: "/users",
    photos: "/photos",
    tables: "/tables",
    bookings: "/bookings",
    menu: "/menu",
    news: "/news",
    reviews: "/reviews-feedback",
    favorites: "/favorites",
    constants: "/constants",
    venuesStats: "/venues/stats",
};

export const urls = {
    auth: {
        refresh: `${paths.auth}/refresh/`,
        register: `${paths.auth}/register/`,
        login: `${paths.auth}/login/`,
        socket: `${paths.auth}/socket/`,
        me: `${paths.auth}/me/`,
    },

    users: {
        list: `${paths.users}/`,
        active: (id: string) => `${paths.users}/${id}/active/`,
        changeRole: (id: string) => `${paths.users}/change-role/${id}/`,
        delete: (id: string) => `${paths.users}/${id}/delete/`,
        reviews: (userId: string) => `${paths.users}/${userId}/reviews/`,
        favorites: (userId: string) => `${paths.users}/${userId}/favorites/`,
        userVenues: (userId: string) => `${paths.users}/${userId}/venues/`,
    },
    profile: {
        get: (userId: string) => `${paths.users}/${userId}/profile/`,
        update: (userId: string) => `${paths.users}/${userId}/profile/`,
        create: (userId: string) => `${paths.users}/${userId}/profile/`,
    },

    venues: {
        list: `${paths.venues}/`,
        detail: (id: string) => `${paths.venues}/${id}/`,
        create: `${paths.venues}/`,
        update: (id: string) => `${paths.venues}/${id}/`,
        delete: (id: string) => `${paths.venues}/${id}/`,
        photos: (venueId: string) => `${paths.venues}/${venueId}/photos/`,
        tables: (venueId: string) => `${paths.venues}/${venueId}/tables/`,
        bookings: (venueId: string, tableId: string) => `${paths.venues}/${venueId}/tables/${tableId}/bookings/`,
        menu: (venueId: string) => `${paths.venues}/${venueId}/menu/`,
        menuItems: (venueId: string, menuId: string) => `${paths.venues}/${venueId}/menu/${menuId}/items/`,
        news: (venueId: string) => `${paths.venues}/${venueId}/news/`,
        reviews: (venueId: string) => `${paths.venues}/${venueId}/reviews/`,
        favorites: (venueId: string) => `${paths.venues}/${venueId}/favorites/`,
        orders: (venueId: string) => `${paths.venues}/${venueId}/orders/`,
        stats: (venueId: string) => `${paths.venues}/${venueId}/stats/`,
        tags: {
            list: (venueId: string) => `${paths.venues}/${venueId}/tags/`,
            detail: (venueId: string, id: string) => `${paths.venues}/${venueId}/tags/${id}/`,
            create: (venueId: string) => `${paths.venues}/${venueId}/tags/`,
            update: (venueId: string, id: string) => `${paths.venues}/${venueId}/tags/${id}/`,
            delete: (venueId: string, id: string) => `${paths.venues}/${venueId}/tags/${id}/`,
        },
        venueTags: {
            list: (venueId: string) => `${paths.venues}/${venueId}/venue_tags/`,
            detail: (venueId: string, id: string) => `${paths.venues}/${venueId}/venue_tags/${id}/`,
            create: (venueId: string) => `${paths.venues}/${venueId}/venue_tags/`,
            update: (venueId: string, id: string) => `${paths.venues}/${venueId}/venue_tags/${id}/`,
            delete: (venueId: string, id: string) => `${paths.venues}/${venueId}/venue_tags/${id}/`,
        },

    },

    venuePhotos: {
        list: `${paths.photos}/`,
        detail: (id: string) => `${paths.photos}/${id}/`,
        create: `${paths.photos}/`,
        delete: (id: string) => `${paths.photos}/${id}/`,
        byVenue: (venueId: string) => `${paths.photos}/?venue=${venueId}`,
        mainForVenue: (venueId: string) => `${paths.photos}/?venue=${venueId}&is_main=true`,
    },

    // tables: {
    //     list: `${paths.tables}/`,
    //     detail: (id: string) => `${paths.tables}/${id}/`,
    //     create: `${paths.tables}/`,
    //     update: (id: string) => `${paths.tables}/${id}/`,
    //     delete: (id: string) => `${paths.tables}/${id}/`,
    //     byVenue: (venueId: string) => `${paths.tables}/?venue=${venueId}`,
    //     activeByVenue: (venueId: string) => `${paths.tables}/?venue=${venueId}&is_active=true`,
    //     bookings: (tableId: string) => `${paths.tables}/${tableId}/bookings/`,
    // },

    // bookings: {
    //     list: `${paths.bookings}/`,
    //     detail: (id: string) => `${paths.bookings}/${id}/`,
    //     create: `${paths.bookings}/`,
    //     update: (id: string) => `${paths.bookings}/${id}/`,
    //     delete: (id: string) => `${paths.bookings}/${id}/`,
    //     byTable: (tableId: string) => `${paths.bookings}/?table=${tableId}`,
    //     active: `${paths.bookings}/?is_active=true`,
    // },

    reviews: {
        list: `${paths.reviews}/reviews/`,
        detail: (id: string) => `${paths.reviews}/reviews/${id}/`,
        create: `${paths.reviews}/reviews/`,
        update: (id: string) => `${paths.reviews}/reviews/${id}/`,
        delete: (id: string) => `${paths.reviews}/reviews/${id}/`,
        favoritesList: `${paths.reviews}/favorites/`,
        favoritesDetail: (id: string) => `${paths.reviews}/favorites/${id}/`,
    },
    constants: {
        constantsList: `${paths.constants}/`
}
};