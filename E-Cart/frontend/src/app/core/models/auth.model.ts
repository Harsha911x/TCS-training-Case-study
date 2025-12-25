export interface AuthResponse {
  token: string;
  role: string;
  username?: string;
  customerId?: string;
  customerName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface CustomerRegistrationRequest {
  name: string;
  country: string;
  state: string;
  city: string;
  address1: string;
  address2?: string;
  zipCode: string;
  phoneNumber: string;
  email: string;
  password: string;
}

