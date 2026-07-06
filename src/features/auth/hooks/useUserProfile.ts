/**
 * 用户详情 Hook - 获取用户信息，支持 API fallback 到 mock 数据
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../shared/api/apiClient';
import { useAuth } from './useAuth';
import type { UserProfile } from '../types';

// Mock 数据 fallback
const MOCK_USER_PROFILE: UserProfile = {
  id: '1',
  username: 'admin',
  nickname: 'admin',
  role: '超级管理员',
  email: 'admin@example.com',
  phone: '138 0013 8000',
  loginTime: '2026-07-02 13:43',
  permissionLevel: '超级管理员',
  accessScope: '全部业务模块',
  status: 'active',
  hasPermissionManagement: true,
};

interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * 获取用户详情 Hook
 * - 优先从 API 获取
 * - API 失败时使用 mock 数据（开发阶段）
 */
export function useUserProfile(): UseUserProfileReturn {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.username) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.user.getProfile(user.username);
      setProfile(data);
    } catch (err) {
      // API 失败时使用 mock 数据
      console.warn('[useUserProfile] API 不可用，使用 mock 数据:', err);
      setProfile(MOCK_USER_PROFILE);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [user?.username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refresh: fetchProfile,
  };
}
