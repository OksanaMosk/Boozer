const paths = {
  auth: "/auth",
  cars: "/venues",
  users: "/users",
  carPhotos: "/venues/photos",
  carStats: "/venues/stats",
  carAveragePrice: "/venues/stats/average",
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

    cars: {
        list: `${paths.cars}/`,
        create: `${paths.cars}/`,
        action: (id: string) => `${paths.cars}/${id}/`,
        photos: (carId: string) => `${paths.cars}/${carId}/photos/`,
        deletePhoto: (photoId: string) => `${paths.carPhotos}/${photoId}/`,
        stats: (carId: string) => `${paths.cars}/${carId}/stats/`,
        averagePriceRegion: `${paths.cars}/stats/average/`,
        averagePriceCountry: `${paths.cars}/stats/average-country/`,
        exchangeRates: `${paths.cars}/exchange-rates/`,
        constants: `${paths.cars}/constants/`,
    },
};

