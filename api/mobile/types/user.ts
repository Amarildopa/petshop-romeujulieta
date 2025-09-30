export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  isActive: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  preferences?: UserPreferences;
  addresses?: Address[];
  loyaltyPoints?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  language: string;
  currency: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface Address {
  id: string;
  userId: string;
  type: 'home' | 'work' | 'other';
  name: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  preferences?: Partial<UserPreferences>;
}

export interface LoginData {
  email: string;
  password: string;
  deviceInfo?: {
    deviceId: string;
    platform: 'ios' | 'android';
    version: string;
    model: string;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenData {
  refreshToken: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface VerifyResetTokenData {
  token: string;
  newPassword: string;
}

export interface SocialLoginData {
  provider: 'google' | 'facebook' | 'apple';
  token: string;
  deviceInfo?: {
    deviceId: string;
    platform: 'ios' | 'android';
    version: string;
    model: string;
  };
}