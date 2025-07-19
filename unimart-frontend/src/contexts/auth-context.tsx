import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User, AuthResponse } from "@/types/auth";
import { login as apiLogin, register as apiRegister, logout as apiLogout } from "../features/auth";
import { useQueryClient } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: { email: string; password: string }) => Promise<AuthResponse>;
  register: (data: { fullName: string; email: string; university: string; password: string }) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  // const navigate = useNavigate();
  useEffect(() => {
    // Load from localStorage on mount
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (data: { email: string; password: string }) => {
    const res = await apiLogin(data);
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
    //   toast.success("Login successful");
      
    }
    return res;
  };

  const register = async (data: { fullName: string; email: string; university: string; password: string }) => {
    const res = await apiRegister(data);
    // Optionally auto-login after register if backend returns token
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
    }
    return res;
  };

  const logout = async () => {
    if (token) {
      await apiLogout(token);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    queryClient.invalidateQueries({ queryKey: ["me"] });
    // navigate("/");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}; 