/**
 * 登录表单 Hook - 封装登录、注册、找回密码表单逻辑
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../shared/ui';
import { useAuth } from './useAuth';
import { apiClient } from '../../../shared/api/apiClient';

const STORAGE_KEY = 'rememberedUsername';

export function useLoginForm() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login } = useAuth();

  // 登录表单
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 找回密码表单
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotPwd, setForgotPwd] = useState('');
  const [forgotConfirmPwd, setForgotConfirmPwd] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  // 注册表单
  const [regAccount, setRegAccount] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPwd, setRegPwd] = useState('');
  const [regConfirmPwd, setRegConfirmPwd] = useState('');
  const [registerOpen, setRegisterOpen] = useState(false);

  // 加载记住的用户名
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { setUsername(saved); setRemember(true); }
  }, []);

  // 记住我功能
  useEffect(() => {
    if (remember && username) {
      localStorage.setItem(STORAGE_KEY, username);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [remember, username]);

  // 登录提交
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return showToast('请输入账号', 'error');
    if (!password.trim()) return showToast('请输入密码', 'error');

    try {
      const data = await apiClient.auth.login(username, password);
      login(data.user);
      showToast('登录成功', 'success');
      navigate('/technical-plan');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '登录失败', 'error');
    }
  }, [username, password, login, navigate, showToast]);

  // 找回密码提交
  const handleForgotSubmit = useCallback(() => {
    if (!forgotPhone.trim()) return showToast('请输入手机号', 'error');
    if (!forgotPwd.trim()) return showToast('请输入新密码', 'error');
    if (!forgotConfirmPwd.trim()) return showToast('请再次输入新密码', 'error');
    if (forgotPwd !== forgotConfirmPwd) return showToast('两次输入的密码不一致', 'error');
    showToast('密码重置成功', 'success');
    setForgotOpen(false);
    setForgotPhone('');
    setForgotPwd('');
    setForgotConfirmPwd('');
  }, [forgotPhone, forgotPwd, forgotConfirmPwd, showToast]);

  // 注册提交
  const handleRegisterSubmit = useCallback(() => {
    if (!regAccount.trim()) return showToast('请输入账户', 'error');
    if (!regPhone.trim()) return showToast('请输入手机号', 'error');
    if (!regPwd.trim()) return showToast('请输入密码', 'error');
    if (!regConfirmPwd.trim()) return showToast('请再次输入密码', 'error');
    if (regPwd !== regConfirmPwd) return showToast('两次输入的密码不一致', 'error');
    showToast('注册成功，请登录', 'success');
    setRegisterOpen(false);
    setRegAccount('');
    setRegPhone('');
    setRegPwd('');
    setRegConfirmPwd('');
  }, [regAccount, regPhone, regPwd, regConfirmPwd, showToast]);

  // 关闭找回密码弹窗
  const closeForgot = useCallback(() => {
    setForgotOpen(false);
    setForgotPhone('');
    setForgotPwd('');
    setForgotConfirmPwd('');
  }, []);

  // 关闭注册弹窗
  const closeRegister = useCallback(() => {
    setRegisterOpen(false);
    setRegAccount('');
    setRegPhone('');
    setRegPwd('');
    setRegConfirmPwd('');
  }, []);

  return {
    // 登录表单状态
    username, setUsername,
    password, setPassword,
    remember, setRemember,
    showPassword, setShowPassword,
    handleLogin,
    // 找回密码
    forgotOpen,
    setForgotOpen,
    forgotPhone, setForgotPhone,
    forgotPwd, setForgotPwd,
    forgotConfirmPwd, setForgotConfirmPwd,
    handleForgotSubmit,
    closeForgot,
    // 注册
    registerOpen, setRegisterOpen,
    regAccount, setRegAccount,
    regPhone, setRegPhone,
    regPwd, setRegPwd,
    regConfirmPwd, setRegConfirmPwd,
    handleRegisterSubmit,
    closeRegister,
  };
}