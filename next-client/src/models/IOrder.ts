import {CurrencyCodeType, IExtraService, IVenue, PriceType, ServiceType} from "@/models/IVenue";
import {IUser} from "@/models/IUser";

export type PaymentType = "Each pays for themselves" | "I pay" | "Someone else pays";
export type BudgetRangeType = "0-1000" | "1000-3000" | "3000-5000" | "5000+";
export type GenderPreferenceType = "ANY" | "MALE" | "FEMALE";
export type OrderStatusType = "DRAFT" | "HOLD" | "CONFIRMED" | "CANCELLED";

export interface IOrderItem {
    id?: string;
    order_id?: string;
    menu_item: number;
    menu_item_name?: string;
    menu_item_price?: number| string;
    quantity: number;
    price?: number;
}

export interface IOrderExtraService {
    id?: string | number;
    service: IExtraService;
    service_type: ServiceType;
    service_name:string;
    quantity: number;
    price: number | string;
    price_type: PriceType;
    currency: CurrencyCodeType;
    row_total?:number;
}


export interface IOrder {
    id?: string;
    venue?:IVenue;
    venue_name?: string;
    user?:IUser;
    venue_id?: string;
    user_id?: string;
    start_date: string;
    end_date: string;
    guests_count: number;
    comment?: string;
    gender_preference?: GenderPreferenceType;
    remaining_seconds: number;
    payment_type?: PaymentType;
    budget_range?: BudgetRangeType;
    budget: number;
    user_latitude?: number | null;
    user_longitude?: number | null;
    venue_latitude?: number | null;
    venue_longitude?: number | null;
    venue_currency?: number | null;
    user_city?: string;
    currency: CurrencyCodeType;
    exchange_rate?:number;
    items?: IOrderItem[];
    table_number?: string | number;
    table_bookings:ITableBooking[];
    tables?: ITableBooking[];
    travel_calculation?: {
        venue: {
            city: string;
        };
    };
    extra_services?: IOrderExtraService[];
    total_price?: string | number;
    venue_impact?: number | string;
    menu_total?: string;
    services_total?: string;
    flight_price: string;
    transfer_price: string;
    status?: OrderStatusType;
    created_at?: string;
    updated_at?: string;
}

export interface ITableBooking {
    id?: string;
    table_id?: string;
    venue_id?: string;
    user_id?: string;
    order: number;
    table: number | string;
    status?: OrderStatusType;
    is_active?: boolean;
    time_range: {
        lower: string;
        upper: string;
    };
}

export interface IStatItem {
    count: number;
    budget_range?: BudgetRangeType;
    gender_preference?: GenderPreferenceType;
    payment_type?: PaymentType;
}

export interface IVenueStats {
    average_check: number;
    total_revenue: number;
    success_orders_count: number;
    total_orders_count: number;
    currency: string;
    budget_distribution: IStatItem[];
    gender_distribution: IStatItem[];
    payment_distribution: IStatItem[];
}

export interface IVenueStatsResponse {
    stats: IVenueStats;
    orders: IOrder[];
}