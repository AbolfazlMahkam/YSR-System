import { createContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import authAPI from "../api/auth";
import localStorageService from "../utiles/localStorageService";
import { toast } from "sonner";

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
  interview_status?: string | null;
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
  checkAuth: () => Promise<void>;
  loginAsUser: (userId: number) => Promise<void>;
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

  async function checkAuth() {
    const storedToken = localStorageService.getToken();

    if (!storedToken) {
      localStorageService.removeUserInfo();
      setTokenState(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    setTokenState(storedToken);
    try {
      const userData = await authAPI.getProfile();
      localStorageService.setUserInfo(userData);
      setUser(userData);
    } catch {
      localStorageService.removeToken();
      localStorageService.removeUserInfo();
      setTokenState(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  // Check authentication on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void checkAuth();
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
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "ورود ناموفق",
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
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "ورود با رمز یکبار مصرف ناموفق",
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
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "ورود با گوگل ناموفق",
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
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "ثبت نام ناموفق",
      );
    }
  }

  async function loginAsUser(userId: number) {
    try {
      const response = await authAPI.loginAsUser(userId);
      const { access_token } = response;

      localStorageService.setToken(access_token);
      setTokenState(access_token);

      const userData = await authAPI.getProfile();

      localStorageService.setUserInfo(userData);
      setUser(userData);

      navigate("/");
    } catch (error: unknown) {
      toast.error(
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "خطا در ورود به حساب کاربر",
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
    loginAsUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
