export interface Booking {
  id: string;
  roomId: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  title: string;
  organizer: string;
  createdAt: Date;
  participantNames?: string;
  ipAddress?: string; // 用户IP地址
}

export interface User {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

export interface AuthData {
  users: User[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export interface ChangePasswordRequest {
  username: string;
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}
