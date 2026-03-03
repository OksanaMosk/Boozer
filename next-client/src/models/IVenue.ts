import {IUser} from "@/models/IUser";


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
    currency:CurrencyCode;
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
    favorite_by?: IUser[];
    news?: INews[];
    background_tables?: string;
}
export type CurrencyCode = "UAH" | "USD" | "EUR";

export interface IVenueWithId extends Omit<IVenue, "id"> {
  id: string;
}

export interface IVenuePhoto {
    id: string;
    venue_id: string;
    photo: string;
    is_main?: boolean;
}


export interface ITag {
    id?: string |null;
    name: string;

}
export interface IVenueTag {
    id?: string;
    venue_id: string;
    tag_id: string;
}

export interface ITable {
    id?: string | number;
    venue?: string | number;
    capacity?: number;
    x: number;
    y: number ;
    width: number;
    height:number;
    is_active?: boolean;
}

export interface ITableBooking {
    id?: string;
    table_id: string;
    venue_id: string;
    user_id?: string;
    time_range: string;
    status?: "pending" | "confirmed" | "canceled";
    is_active?: boolean;
}

export interface IMenu {
    id?: string | null;
    venue_id: string;
    title: string;
    items?: IMenuItem[];
    is_published?:boolean;

}

export interface IMenuItem {
    id?: string | null;
    menu_id: string;
    name: string;
    description?: string;
    price: number;
    currency:string;
    position: number;
    photo_menu_item:string;
}

export interface INews {
    id?: number |string;
    venue?: string;
    title: string;
    content: string;
    images?:INewsPhoto[] | [];
    is_pinned: boolean;
    end_date?: string | null;
    created_at?: string;
    updated_at?: string;
    status:NewsStatus;
    type:NewsType;
}

export type NewsType = "general" | "promotion" | "event";
export type NewsStatus = "active" | "pending";

export interface INewsPhoto {
    id?: string;
    news_id: string;
    image: string;
    is_cover?: boolean;
    created_at?: string;
    updated_at?: string;
}


export interface ITravelLogistics {
    id?: string;
    venue: string;
    step_type: "to_airport" | "flight" | "from_airport";
    price_per_km: number;
}

export interface IAirport {
    id: string;
    name: string;
    iata_code: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
}

export interface ITravelSegment {
    step: string;
    km: number;
    cost: number;
}

export interface ITravelEstimate {
    start_airport: string;
    end_airport: string;
    segments: ITravelSegment[];
    total_price: number;
}

export type ServiceType ='hotel' | 'insurance' | 'decoration'

export type PriceType = 'fixed' | 'per_day'

export interface IExtraService {
    id: string;
    venue: string;
    name: string;
    service_type: ServiceType;
    service_type_display?: string;
    price_type: PriceType;
    price_type_display?: string;
    price: number | string;
}

export interface IOrder {
    id?: string;
    venue_id: string;
    user_id: string;
    items?: IOrderItem[];
    total_price?: number;
    status?: string;
    created_at?: string;
    updated_at?: string;
}

export interface IOrderItem {
    id?: string;
    order_id: string;
    menu_item_id: string;
    quantity: number;
    price: number;
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

export interface IReviewPhoto {
    id?: string;
    review_id: string;
    photo: string;
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
