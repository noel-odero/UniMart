import { useAuth } from "@/contexts/auth-context";
import type { AuthResponse } from "@/types/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export async function register(data: {
  fullName: string;
  email: string;
  university: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}


export async function getMe(token: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}


export async function login(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function logout(token: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser, setToken } = useAuth();
  return useMutation<AuthResponse, Error, { email: string; password: string }>({
    mutationFn: login,
    onSuccess: (data) => {
      console.log(data);
      localStorage.setItem("token", data?.token || "");
      localStorage.setItem("user", JSON.stringify(data.user));
      if(data?.user) {
        setUser(data?.user);
      }
      if(data?.token) {
        setToken(data?.token);
      }
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Login successful");
      navigate("/dashboard");
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  return useMutation<
    AuthResponse,
    Error,
    { fullName: string; email: string; university: string; password: string }
  >({
    mutationFn: register,
    onSuccess: (data) => {
      toast.success(
        `Registration successful, please login to continue ${data?.user?.fullName}`
      );
      navigate("/login");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Registration failed, please try again");
    },
  });
}

export function useGetMe() {
  return useQuery<AuthResponse, Error, { token: string }>({
    queryFn: () => getMe(localStorage.getItem("token") || ""),
    queryKey: ["me"],
    enabled: !!localStorage.getItem("token"),
  });
}

