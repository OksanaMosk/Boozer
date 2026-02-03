export interface ICar {
    id: string;
    brand: string;
    model: string;
    year: number;
    mileage: number;
    price: number;
    currency: string;
    price_usd: number;
    price_eur: number;
    condition: string;
    max_speed: number;
    seats_count: number;
    engine_volume: number;
    has_air_conditioner: boolean;
    fuel_type: string;
    location: string;
    description: string;
    status: string;
    views: number;
    daily_views: number;
    weekly_views: number;
    monthly_views: number;
    created_at: string;
    updated_at: string;
    exchange_rate_id: string;
    last_exchange_update: string | null;
    edit_attempts?: number;
    photos: ICarPhoto[];
    region_avg_price?: {
    USD: number;
    EUR: number;
    UAH: number;
  };
    venue_admin_id?:string;
    country_avg_price?: {
    USD: number;
    EUR: number;
    UAH: number;
  };
}

export interface ICarPhoto {
    id: string;
    car_id: string;
    photo: string;
}
export interface GetUserCarsResponse {
  cars: ICar[];
}