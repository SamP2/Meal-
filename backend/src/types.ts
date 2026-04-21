// Shared TypeScript types for the Mess Finder API

export type UserRole = 'student' | 'mess_owner';

export interface User {
  id: string;
  role: UserRole;
  email: string;
  created_at: string;
}

export interface Mess {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  opening_time: string;
  closing_time: string;
  price_range: string | null;
  is_open: boolean;
  is_veg: boolean;
  is_verified: boolean;
  cuisine: string;
  cover_image: string | null;
  rating: number;
  review_count: number;
  created_at: string;
  distance_km?: number;
}

export interface Menu {
  id: string;
  mess_id: string;
  date: string;
  created_at: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  menu_id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  sort_order: number;
  created_at: string;
}

export interface Review {
  id: string;
  mess_id: string;
  student_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface RegisterBody {
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface CreateMessBody {
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  opening_time: string;
  closing_time: string;
  price_range?: string;
  cuisine?: string;
  is_veg?: boolean;
  cover_image?: string;
}

export interface MenuItemInput {
  name: string;
  description?: string;
  price: number;
  image?: string;
}

export interface UpdateMenuBody {
  items: MenuItemInput[];
}

export interface CreateReviewBody {
  rating: number;
  comment?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
      };
    }
  }
}
