const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...restOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  } else {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (storedToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${storedToken}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers,
    ...restOptions,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Auth API
export const authApi = {
  register: (data: RegisterRequest) =>
    fetchApi<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: LoginRequest) =>
    fetchApi<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
};

// Vehicles API
export const vehiclesApi = {
  search: (params: VehicleSearchParams) => {
    const query = new URLSearchParams();
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.category) query.set('category', params.category);
    if (params.branch) query.set('branch', params.branch);
    return fetchApi<VehicleResponse[]>(`/vehicles?${query.toString()}`);
  },
  getAll: () => fetchApi<VehicleResponse[]>('/vehicles'),
  getById: (id: string) => fetchApi<VehicleResponse>(`/vehicles/${id}`),
  create: (data: VehicleRequest) =>
    fetchApi<VehicleResponse>('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: VehicleRequest) =>
    fetchApi<VehicleResponse>(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) =>
    fetchApi<VehicleResponse>(`/vehicles/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  delete: (id: string) =>
    fetchApi<void>(`/vehicles/${id}`, { method: 'DELETE' }),
};

// Bookings API
export const bookingsApi = {
  create: (data: BookingRequest) =>
    fetchApi<BookingResponse>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  getAll: () => fetchApi<BookingResponse[]>('/bookings'),
  getById: (id: string) => fetchApi<BookingResponse>(`/bookings/${id}`),
  cancel: (id: string) =>
    fetchApi<BookingResponse>(`/bookings/${id}/cancel`, { method: 'PATCH' }),
};

export const userApi = {
  getProfile: () =>
    fetchApi<UserProfileResponse>('/users/me'),
  updateProfile: (data: UpdateProfileRequest) =>
    fetchApi<UserProfileResponse>('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data: ChangePasswordRequest) =>
    fetchApi<{ message: string }>('/users/me/password', { method: 'PUT', body: JSON.stringify(data) }),
};

export const adminUserApi = {
  getAll: (params?: { search?: string; role?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.role && params.role !== 'ALL') query.set('role', params.role);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchApi<UserProfileResponse[]>(`/admin/users${qs}`);
  },
  getById: (id: string) =>
    fetchApi<UserProfileResponse>(`/admin/users/${id}`),
  updateRole: (id: string, role: string) =>
    fetchApi<UserProfileResponse>(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  updateStatus: (id: string, enabled: boolean) =>
    fetchApi<UserProfileResponse>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    }),
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE' }),
};

// Types
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

export interface VehicleSearchParams {
  startDate?: string;
  endDate?: string;
  category?: string;
  branch?: string;
}

export interface VehicleRequest {
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  category: string;
  transmission: string;
  dailyRate: number;
  imageUrl?: string;
  branch: string;
}

export interface VehicleResponse {
  id: string;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  category: string;
  transmission: string;
  dailyRate: number;
  imageUrl?: string;
  status: string;
  branch: string;
  createdAt: string;
}

export interface BookingRequest {
  vehicleId: string;
  startDate: string;
  endDate: string;
}

export interface BookingResponse {
  id: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleName: string;
  vehicleCategory: string;
  branch: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: string;
  createdAt: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  drivingLicenseNumber?: string;
  address?: string;
  city?: string;
  role: 'CUSTOMER' | 'ADMIN';
  enabled: boolean;
  createdAt: string;
  totalBookings: number;
}

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber?: string;
  drivingLicenseNumber?: string;
  address?: string;
  city?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
