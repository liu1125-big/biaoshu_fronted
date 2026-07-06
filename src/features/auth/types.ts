/**
 * Auth 模块类型定义
 */

export interface User {
  username: string;
  nickname?: string;
  role: string;
}

export interface UserProfile {
  id: string;
  username: string;
  nickname?: string;
  role: string;
  email?: string;
  phone?: string;
  loginTime?: string;
  permissionLevel?: string;
  accessScope?: string;
  status?: 'active' | 'inactive' | 'disabled';
  hasPermissionManagement?: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterFormData {
  account: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormData {
  phone: string;
  newPassword: string;
  confirmNewPassword: string;
}