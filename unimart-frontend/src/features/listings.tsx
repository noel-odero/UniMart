import type { AuthResponse } from "@/types/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

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
  soldPrice?: number;
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

export async function createListing(data: {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: File[];
}): Promise<{ listing: Listing; message: string }> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token");
  }

  // Get user data to include university
  const userResponse = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!userResponse.ok) {
    throw new Error("Failed to get user data");
  }
  
  const userData = await userResponse.json();
  const university = userData.user?.university || "";

  // Convert images to base64 strings for now
  const imagePromises = data.images.map(file => {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  });

  const imageUrls = await Promise.all(imagePromises);

  const requestData = {
    title: data.title,
    description: data.description,
    price: data.price,
    category: data.category,
    condition: data.condition,
    university: university,
    images: imageUrls
  };

  const res = await fetch(`${API_BASE}/listings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestData),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create listing");
  }
  
  return res.json();
}

export async function updateListing(id: string, data: {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  condition?: string;
}): Promise<{ listing: Listing; message: string }> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token");
  }

  const res = await fetch(`${API_BASE}/listings/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update listing");
  }
  
  return res.json();
}

export async function deleteListing(id: string): Promise<{ message: string }> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token");

  const res = await fetch(`${API_BASE}/listings/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete listing");
  return data;
}

// API: Get user's wishlist listings
export async function getWishlistListings(): Promise<Listing[]> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token");
  const res = await fetch(`${API_BASE}/listings/user/wishlist`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch wishlist");
  return data.wishlist;
}

// API: Toggle wishlist status for a listing
export async function toggleWishlist(listingId: string): Promise<{ inWishlist: boolean; message: string }> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token");
  const res = await fetch(`${API_BASE}/listings/${listingId}/wishlist`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update wishlist");
  return data;
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

export function useCreateListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createListing,
    onSuccess: (data) => {
      // Invalidate user listings to refresh the list
      queryClient.invalidateQueries({ queryKey: ["user-listings"] });
      // Invalidate all listings to refresh browse page
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Listing created successfully!");
    },
    onError: (error) => {
      console.error("Create listing error:", error);
      toast.error(error.message || "Failed to create listing");
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateListing(id, data),
    onSuccess: (data, variables) => {
      // Invalidate user listings to refresh the list
      queryClient.invalidateQueries({ queryKey: ["user-listings"] });
      // Invalidate all listings to refresh browse page
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      // Invalidate specific listing
      queryClient.invalidateQueries({ queryKey: ["listing", variables.id] });
      toast.success("Listing updated successfully!");
    },
    onError: (error) => {
      console.error("Update listing error:", error);
      toast.error(error.message || "Failed to update listing");
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Listing deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete listing");
    },
  });
}

// React Query: Fetch wishlist listings
export function useGetWishlistListings() {
  return useQuery({
    queryKey: ["wishlist-listings"],
    queryFn: getWishlistListings,
  });
}

// React Query: Toggle wishlist
export function useToggleWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingId: string) => toggleWishlist(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["user-listings"] });
    },
  });
}
