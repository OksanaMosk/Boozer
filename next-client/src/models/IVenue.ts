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
    tables?: ITableBooking[];
    menus?: IMenu[];
    orders?: IOrder[];
    reviews?: IReview[];
    favorite_by?: IUser[];
    news?: INews[];
}

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

export interface ITableBooking {
    id?: string;
    venue_id: string;
    table: string;
    time_range: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}


export interface IMenu {
    id?: string | null;
    venue_id: string;
    title: string;
    items?: IMenuItem[];
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


export interface INews {
    id?: string;
    venue_id: string;
    title: string;
    content: string;
    created_at?: string;
    updated_at?: string;
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
