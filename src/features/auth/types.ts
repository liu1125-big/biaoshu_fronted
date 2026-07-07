/**
 * Auth 模块类型定义
 */

export interface User {
  id: string;
  username: string;
  name?: string;
  nickname?: string;
  status: string;
  roles: Array<{ id: string; code: string; name: string; status: string }>;
  last_login_at?: string;
  created_at?: string;
  updated_at?: string;
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

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
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

// ============ RBAC 类型定义 ============

export interface UserRole {
  id: string;
  code: string;
  name: string;
  status: string;
}

export interface UserItem {
  id: string;
  username: string;
  name?: string;
  status: string;
  roles: UserRole[];
  last_login_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PermissionItem {
  id: string;
  code: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface MenuItem {
  id: string;
  parent_id?: string;
  name: string;
  route?: string;
  component?: string;
  icon?: string;
  sort_order: number;
  visible: boolean;
  permission_code?: string;
  children?: MenuItem[];
}

export interface RoleItem {
  id: string;
  code: string;
  name: string;
  status: string;
  permissions: PermissionItem[];
  menus: MenuItem[];
  created_at?: string;
  updated_at?: string;
}