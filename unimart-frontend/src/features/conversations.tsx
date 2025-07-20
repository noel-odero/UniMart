import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Types for conversations and messages
export interface Message {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  recipient: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  content: string;
  messageType: 'text' | 'image' | 'offer';
  listing: string;
  offer?: {
    amount: number;
    status: 'pending' | 'accepted' | 'rejected';
  };
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    fullName: string;
    avatar?: string;
    university: string;
  }>;
  listing: {
    _id: string;
    title: string;
    images: string[];
    price: number;
    category: string;
  };
  lastMessage?: Message;
  lastActivity: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface MessagesResponse {
  messages: Message[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface SendMessageRequest {
  recipientId: string;
  listingId: string;
  content: string;
  messageType?: 'text' | 'image' | 'offer';
  offer?: {
    amount: number;
  };
}

export interface StartConversationRequest {
  listingId: string;
  initialMessage: string;
}

// API Functions
export async function getConversations(params?: {
  page?: number;
  limit?: number;
}): Promise<ConversationsResponse> {
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

  const res = await fetch(`${API_BASE}/messages/conversations?${searchParams.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function getMessages(conversationId: string, params?: {
  page?: number;
  limit?: number;
}): Promise<MessagesResponse> {
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

  const res = await fetch(`${API_BASE}/messages/conversations/${conversationId}/messages?${searchParams.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function sendMessage(data: SendMessageRequest): Promise<{ message: Message; conversationId: string }> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token");
  }

  const res = await fetch(`${API_BASE}/messages/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function startConversation(listingId: string, initialMessage: string) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/messages/start-conversation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ listingId, initialMessage }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to start conversation");
  return data;
}

export async function getUnreadCount(): Promise<{ unreadCount: number }> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token");
  }

  const res = await fetch(`${API_BASE}/messages/unread-count`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function markConversationAsRead(conversationId: string): Promise<{ message: string }> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token");
  }

  const res = await fetch(`${API_BASE}/messages/conversations/${conversationId}/mark-read`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

// React Query Hooks
export function useGetConversations(params?: {
  page?: number;
  limit?: number;
}) {
  const token = localStorage.getItem("token");
  
  return useQuery({
    queryKey: ["conversations", params],
    queryFn: () => getConversations(params),
    enabled: !!token,
  });
}

export function useGetMessages(conversationId: string, params?: {
  page?: number;
  limit?: number;
}) {
  const token = localStorage.getItem("token");
  
  return useQuery({
    queryKey: ["messages", conversationId, params],
    queryFn: () => getMessages(conversationId, params),
    enabled: !!token && !!conversationId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (data) => {
      // Invalidate conversations to refresh the list
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      // Invalidate messages for this conversation
      queryClient.invalidateQueries({ queryKey: ["messages", data.conversationId] });
      toast.success("Message sent successfully");
    },
    onError: (error) => {
      console.error("Send message error:", error);
      toast.error("Failed to send message");
    },
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId, initialMessage }: { listingId: string; initialMessage: string }) =>
      startConversation(listingId, initialMessage),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success(data.messageText || "Conversation started!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to start conversation");
    },
  });
}

export function useGetUnreadCount() {
  const token = localStorage.getItem("token");
  
  return useQuery({
    queryKey: ["unread-count"],
    queryFn: getUnreadCount,
    enabled: !!token,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useMarkConversationAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markConversationAsRead,
    onSuccess: (data, conversationId) => {
      // Invalidate conversations to refresh unread counts
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      // Invalidate unread count
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
      toast.success(data.message);
    },
    onError: (error) => {
      console.error("Mark as read error:", error);
      toast.error("Failed to mark conversation as read");
    },
  });
}
