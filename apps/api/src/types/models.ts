export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface PublicUser extends Omit<User, 'passwordHash'> {}

export type ListingStatus = 'active' | 'sold' | 'draft';
export type ListingCondition = 'new' | 'used' | 'refurbished';

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  condition: ListingCondition;
  status: ListingStatus;
  location: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}
