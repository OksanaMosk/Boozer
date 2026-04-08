import {IOrder} from "@/models/IOrder";

export type CategoryType = "mains" | "salads" | "soups" | "drinks" | "desserts";
export type NewsType = "general" | "promotion" | "event";
export type NewsStatus = "active" | "pending";
export type ServiceType = 'hotel' | 'insurance' | 'decoration';
export type PriceType = 'fixed' | 'per_day';
export type CurrencyCodeType = "UAH" | "USD" | "EUR";

export interface ITag {
    id?: number | string | null;
    name: string;
}


export interface IVenuePhoto {
    id: string;
    venue_id: string;
    photo: string;
    is_main?: boolean;
}

export interface ITable {
    id?: string | number;
    venue?: string | number;
    capacity?: number;
    x: number;
    y: number;
    width: number;
    height: number;
    is_active?: boolean;
}

export interface IMenuItem {
    id?: string | null;
    menu_id: string;
    name: string;
    description?: string;
    price: number;
    position: number;
    photo_menu_item: string;
    currency: CurrencyCodeType;
    category: CategoryType;
}

export interface IMenu {
    id?: string | null;
    venue_id: string;
    title: string;
    items?: IMenuItem[];
    is_published?: boolean;
}

export interface INewsPhoto {
    id?: string;
    news_id: string;
    image: string;
    is_cover?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface INews {
    id?: number | string;
    venue?: string;
    title: string;
    content: string;
    images?: INewsPhoto[] | [];
    is_pinned: boolean;
    end_date?: string | null;
    created_at?: string;
    updated_at?: string;
    status: NewsStatus;
    type: NewsType;
}

export interface IReviewPhoto {
    id?: string;
    review_id: string;
    photo: string;
}

export interface IReview {
    id?: string;
    venue_id: string;
    user_id: string;
    rating: number;
    comment?: string;
    created_at?: string;
    updated_at?: string;
    photos?: IReviewPhoto[];
}

export interface IExtraService {
    id?: string | number;
    venue: string;
    name: string;
    service_type: ServiceType;
    service_type_display?: string;
    quantity: number;
    price_type: PriceType;
    price_type_display?: string;
    price: number | string;
    currency: CurrencyCodeType;
}


export interface IVenue {
    id?: string;
    venue_admin_id: string;
    name: string;
    country: string;
    city: string;
    address: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    description?: string;
    opening_hours?: Record<string, any>;
    features?: Record<string, any>;
    average_check?: number;
    currency: CurrencyCodeType;
    rating?: number;
    reviews_count?: number;
    status?: string;
    views?: number;
    daily_views?: number;
    weekly_views?: number;
    monthly_views?: number;
    created_at?: string;
    updated_at?: string;
    last_exchange_update?: string | null;
    edit_attempts?: number;
    tags?: ITag[];
    photos?: IVenuePhoto[];
    tables?: ITable[];
    menus?: IMenu[];
    orders?: IOrder[];
    reviews?: IReview[];
    favorite_by?: any[];
    news?: INews[];
    background_tables?: string;
    is_favorite?: boolean;
}

export interface IVenueWithId extends Omit<IVenue, "id"> {
  id: string;
}

export interface GetUserVenuesResponse {
    venues: IVenue[];
}

export interface PaginatedResponse<T> {
  total_items: number;
  total_pages: number;
  prev: boolean;
  next: boolean;
  data: T[];
}

export interface IChartPoint {
  name: string;
  value: number;
}

export interface IStats {
  total_views: number;
  daily: IChartPoint[];
  weekly: IChartPoint[];
  monthly: IChartPoint[];
  daily_views: number;
  weekly_views: number;
  monthly_views: number;
}