import {IVenue} from "@/models/IVenue";

export interface IReviewPhoto {
    id?: number;
    photo: string;
}

export interface IReview {
    id?: string | number;
    author_name: string;
    venue: string | number;
    order?: number | null;
    rating: number;
    comment: string | null;
    review_photos: IReviewPhoto[];
    likes_count: number;
    is_liked: boolean;
    owner_reply: string | null;
    created_at: string;
}

export type ReviewReasonType = 'Spam' | 'Fake' | 'Abuse' | 'Other';

export interface IReviewReport {
    id?: string | number;
    review: number;
    reason: ReviewReasonType;
    comment: string | null;
}

export type TopCategoryType =
    | 'wedding'
    | 'corporate'
    | 'birthday'
    | 'date'
    | 'party'
    | 'meeting'
    | 'general';

export const CATEGORY_LABELS: Record<TopCategoryType, string> = {
    wedding: 'Wedding',
    corporate: 'Corporate',
    birthday: 'Birthday',
    date: 'Date',
    party: 'Party',
    meeting: 'Meeting',
    general: 'General',
};

export const INITIAL_CATEGORIES: { value: TopCategoryType; label: string }[] =
    Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
        value: value as TopCategoryType,
        label
    }));

export interface IFavoriteCollection {
    id?: string | number;
    name: string;
    category: TopCategoryType;
    category_display?: string;
    is_staff_top: boolean;
    order?: number;
    items_count?: number;
    items?: IFavoriteItem[];
    venues: IVenue[];
}

export interface IFavoriteVenue {
    id?: string | number;
    user: number;
    venue: string | number
    collection: number | null;
    position: number;
}
export interface IFavoriteItem {
    id: string | number;
    venue: IVenue;
    position: number;
    category: TopCategoryType;
}


export interface IFavoriteCollectionDetail extends IFavoriteCollection {
    items: IFavoriteItem[];
}