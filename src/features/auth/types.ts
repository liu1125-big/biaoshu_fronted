/**
 * Auth 模块类型定义
 */

export interface User {
  username: string;
  nickname?: string;
  role: string;
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