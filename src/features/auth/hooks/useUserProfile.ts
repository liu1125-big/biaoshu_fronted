/**
 * 用户详情 Hook - 调用 /api/auth/me 获取用户信息
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../shared/api/apiClient';
import type { User } from '../types';

interface UseUserProfileReturn {
  profile: User | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * 获取用户详情 Hook
 * 调用 /api/auth/me 获取当前登录用户信息
 */
export function useUserProfile(): UseUserProfileReturn {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.auth.me();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取用户信息失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refresh: fetchProfile,
  };
}
