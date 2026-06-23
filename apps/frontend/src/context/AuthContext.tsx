import { createContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import authAPI from "../api/auth";
import localStorageService from "../utiles/localStorageService";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  national_code?: string;
  birth_date?: string;
  gender?: string;
  education?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  loginWithOtp: (
    phone: string,
    code?: number,
  ) => Promise<{ code?: number; access_token?: string }>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

interface RegisterData {
  phone: string;
  first_name: string;
  last_name: string;
  password: string;
  role?: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const isAuthenticated = !!token && !!user;

  function checkAuth() {
    const storedToken = localStorageService.getToken();
    const storedUser = localStorageService.getUserInfo();

    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUser(storedUser);
    }
    setIsLoading(false);
  }

  // Check authentication on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth();
  }, []);

  async function login(phone: string, password: string) {
    try {
      const response = await authAPI.login({ phone, password });
      const { access_token } = response;

      // Store token
      localStorageService.setToken(access_token);
      setTokenState(access_token);

      // Fetch user info from backend
      const userData = await authAPI.getProfile();

      localStorageService.setUserInfo(userData);
      setUser(userData);

      navigate("/");
    } catch (error: unknown) {
      throw new Error(
        (error as { response?: { data?: { message?: string } } }).response
          ?.data?.message || "ورود ناموفق",
      );
    }
  }

  async function loginWithOtp(phone: string, code?: number) {
    try {
      const response = await authAPI.loginByOtp({ phone, code });

      // First call returns OTP code (in development)
      if (response.code) {
        return { code: response.code };
      }

      // Second call returns access token
      if (response.access_token) {
        const { access_token } = response;
        localStorageService.setToken(access_token);
        setTokenState(access_token);

        // Fetch user info from backend
        const userData = await authAPI.getProfile();

        localStorageService.setUserInfo(userData);
        setUser(userData);

        navigate("/");
        return { access_token };
      }

      return {};
    } catch (error: unknown) {
      throw new Error(
        (error as { response?: { data?: { message?: string } } }).response
          ?.data?.message || "ورود با رمز یکبار مصرف ناموفق",
      );
    }
  }

  async function loginWithGoogle(credential: string) {
    try {
      const response = await authAPI.loginWithGoogle(credential);
      const { access_token } = response;

      localStorageService.setToken(access_token);
      setTokenState(access_token);

      // Fetch user info from backend
      const userData = await authAPI.getProfile();

      localStorageService.setUserInfo(userData);
      setUser(userData);

      navigate("/");
    } catch (error: unknown) {
      throw new Error(
        (error as { response?: { data?: { message?: string } } }).response
          ?.data?.message || "ورود با گوگل ناموفق",
      );
    }
  }

  async function register(userData: RegisterData) {
    try {
      await authAPI.register({
        ...userData,
        role: userData.role || "user",
      });

      await login(userData.phone, userData.password);

      navigate("/forms/self-declaration");
    } catch (error: unknown) {
      throw new Error(
        (error as { response?: { data?: { message?: string } } }).response
          ?.data?.message || "ثبت نام ناموفق",
      );
    }
  }

  function logout() {
    localStorageService.removeToken();
    localStorageService.removeUserInfo();
    setTokenState(null);
    setUser(null);
    navigate("/login");
  }

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    loginWithOtp,
    loginWithGoogle,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
