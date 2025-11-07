export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  city?: string | null;
  duprId?: string | null;
  duprRating?: number | null;
  role: "USER" | "SUPER_ADMIN";
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  city?: string;
  avatar?: string;
  duprId?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
