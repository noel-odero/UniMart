import type { AuthResponse } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
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
  return useMutation<AuthResponse, Error, { email: string; password: string }>({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem("token", data?.token || "");
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Login successful");
      navigate("/dashboard");
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

export function useRegister() {
  return useMutation<AuthResponse, Error, { fullName: string; email: string; university: string; password: string }>({
    mutationFn: register,
  });
}
