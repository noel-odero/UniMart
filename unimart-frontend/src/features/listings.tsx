import type { AuthResponse } from "@/types/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Types for listings
export interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  university: string;
  location: string;
  status: 'active' | 'sold' | 'inactive';
  views: number;
  seller: {
    _id: string;
    fullName: string;
    university: string;
    avatar?: string;
    rating?: number;
    reviewCount?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ListingsResponse {
  listings: Listing[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface SingleListingResponse {
  listing: Listing;
}

// API Functions
export async function getListings(params?: {
  page?: number;
  limit?: number;
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  university?: string;
  search?: string;
  sortBy?: string;
}): Promise<ListingsResponse> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
  }

  const res = await fetch(`${API_BASE}/listings?${searchParams.toString()}`);
  return res.json();
}

export async function getListing(id: string): Promise<SingleListingResponse> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/listings/${id}`, {
    headers,
  });
  return res.json();
}

export async function getUserListings(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<ListingsResponse> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token");
  }

  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
  }

  const res = await fetch(`${API_BASE}/listings/user/my-listings?${searchParams.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

// React Query Hooks
export function useGetListings(params?: {
  page?: number;
  limit?: number;
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  university?: string;
  search?: string;
  sortBy?: string;
}) {
  return useQuery({
    queryKey: ["listings", params],
    queryFn: () => getListings(params),
  });
}

export function useGetListing(id: string) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => getListing(id),
    enabled: !!id,
  });
}

export function useGetMyListings(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const token = localStorage.getItem("token");
  
  return useQuery({
    queryKey: ["user-listings", params],
    queryFn: () => getUserListings(params),
    enabled: !!token,
  });
}
