const paths = {
  auth: "/auth",
  venues: "/venues",
  users: "/users",
  venuePhotos: "/venues/photos",
  venueStats: "/venues/stats",
  venueAveragePrice: "/venues/stats/average",
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
        userCars: (userId: string) => `${paths.users}/${userId}/venues/`,
    },
    profile: {
        get: (userId: string) => `${paths.users}/${userId}/profile/`,
        update: (userId: string) => `${paths.users}/${userId}/profile/`,
        create: (userId: string) => `${paths.users}/${userId}/profile/`,
    },

    venue: {
        list: `${paths.venues}/`,
        create: `${paths.venues}/`,
        action: (id: string) => `${paths.venues}/${id}/`,
        photos: (carId: string) => `${paths.venues}/${carId}/photos/`,
        deletePhoto: (photoId: string) => `${paths.venuePhotos}/${photoId}/`,
        stats: (carId: string) => `${paths.venues}/${carId}/stats/`,
        averagePriceRegion: `${paths.venues}/stats/average/`,
        averagePriceCountry: `${paths.venues}/stats/average-country/`,
        exchangeRates: `${paths.venues}/exchange-rates/`,
        constants: `${paths.venues}/constants/`,
    },
};

