export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface Mess {
  id: string;
  name: string;
  description: string;
  rating: number;
  distance: string;
  hours: string;
  image: string;
  isVeg: boolean;
  isVerified: boolean;
  isOpen: boolean;
  priceRange: '$' | '$$' | '$$$';
  cuisine: string;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}
