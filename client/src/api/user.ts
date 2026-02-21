import instance from "./axios";

// Types
export interface RegisterData {
  fullname: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// API Calls
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

  getProfile: async () => {
    const response = await instance.get("/auth/get-user/:id");
    return response.data;
  },

  updateProfile: async (data: Partial<RegisterData>) => {
    const response = await instance.put("/auth/update", data);
    return response.data;
  },
  updateProfileStatus: async (data: Partial<RegisterData>) => {
    const response = await instance.put("/auth/update-status", data);
    return response.data;
  },
};

export default userApi;