import React, {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import userApi, {
  LoginData,
  RegisterData,
  User as ApiUser,
  AuthResponse,
} from "../api/user";
import axios from "../api/axios";

interface UserContextType {
  user: ApiUser | null;
  setUser: React.Dispatch<React.SetStateAction<ApiUser | null>>;

  login: (credentials: LoginData) => Promise<ApiUser>;
  register: (data: RegisterData) => Promise<ApiUser>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<RegisterData>) => Promise<ApiUser>;
  updateStatus: () => Promise<ApiUser>;
  loadUserFromStorage: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

const UserDataProvider = ({ children }: Props) => {
  const [user, setUser] = useState<ApiUser | null>(null);

  const setSession = (auth: AuthResponse) => {
    localStorage.setItem("token", auth.token);
    localStorage.setItem("user", JSON.stringify(auth.data));
    axios.defaults.headers.common["Authorization"] = `Bearer ${auth.token}`;
    setUser(auth.data);
  };

  const loadUserFromStorage = useCallback(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const login = async (credentials: LoginData) => {
    const resp = await userApi.login(credentials);
    setSession(resp as AuthResponse);
    return (resp as AuthResponse).data;
  };

  const register = async (data: RegisterData) => {
    const resp = await userApi.register(data);
    setSession(resp as AuthResponse);
    return (resp as AuthResponse).data;
  };

  const logout = async () => {
    try {
      await userApi.logout();
    } catch {
      // swallow
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const updateProfile = async (data: Partial<RegisterData>) => {
    const resp = await userApi.updateProfile(data);
    const updated = (resp as any).data || resp;
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
    return updated;
  };

  const updateStatus = async () => {
    const resp = await userApi.updateProfileStatus({});
    const updated = (resp as any).data || resp;
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
    return updated;
  };

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        updateProfile,
        updateStatus,
        loadUserFromStorage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserDataProvider;