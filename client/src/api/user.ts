import instance from "./axios";

export type UserRole = "contractor" | "worker";

export interface Location {
  type: "Point";
  coordinates: [number, number];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  location?: Location;
  profileImage?: string;
  skills?: string[];
  rating?: number;
  totalReviews?: number;
  isAvailable?: boolean;
  [key: string]: any;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  location: Location;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: User;
  token: string;
}

const userApi = {
  register: async (data: RegisterData) => {
    const response = await instance.post("/auth/register", data);
    return response.data;
  },
  login: async (data: LoginData) => {
    const response = await instance.post("/auth/login", data);
    return response.data;
  },
  logout: async () => {
    const response = await instance.post("/auth/logout");
    return response.data;
  },
  getProfile: async (id: string) => {
    const response = await instance.get(`/auth/get-user/${id}`);
    return response.data;
  },
  updateProfile: async (data: Partial<RegisterData>) => {
    const response = await instance.patch("/auth/update", data);
    return response.data;
  },
  updateProfileStatus: async (data: Partial<RegisterData>) => {
    const response = await instance.patch("/auth/update-status", data);
    return response.data;
  },
  getWorkers: async (skills?: string[]) => {
    const params = skills && skills.length > 0 ? { skills: skills.join(",") } : {};
    const response = await instance.get("/auth/workers", { params });
    return response.data;
  },
};

export default userApi;