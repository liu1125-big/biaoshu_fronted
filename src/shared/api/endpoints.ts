/**
 * API 路径常量
 */

export const ENDPOINTS = {
  MARKDOWN_CONVERT: '/api/markdown/convert',
  PROJECTS: '/api/projects',
  PROJECT: '/api/projects/{project_id}',
  USER_PROFILE: '/api/users/{user_id}',
  USER_UPDATE: '/api/users/{user_id}',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_REFRESH: '/api/auth/refresh',
  AUTH_ME: '/api/auth/me',
} as const;
