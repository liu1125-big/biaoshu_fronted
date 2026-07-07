/**
 * RBAC 模块 Mock 数据
 */

import type { UserItem, RoleItem, PermissionItem, MenuItem } from '../types';

// ============ Mock 用户数据 ============
export const mockUsers: UserItem[] = [
  {
    id: '1',
    username: 'admin',
    name: '管理员',
    status: 'enabled',
    roles: [{ id: '1', code: 'admin', name: '系统管理员', status: 'enabled' }],
    last_login_at: '2026-07-06T10:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-07-06T10:00:00Z',
  },
  {
    id: '2',
    username: 'zhangsan',
    name: '张三',
    status: 'enabled',
    roles: [{ id: '2', code: 'user', name: '普通用户', status: 'enabled' }],
    last_login_at: '2026-07-05T15:30:00Z',
    created_at: '2026-02-15T00:00:00Z',
    updated_at: '2026-07-05T15:30:00Z',
  },
  {
    id: '3',
    username: 'lisi',
    name: '李四',
    status: 'disabled',
    roles: [{ id: '2', code: 'user', name: '普通用户', status: 'enabled' }],
    last_login_at: '2026-06-20T09:00:00Z',
    created_at: '2026-03-10T00:00:00Z',
    updated_at: '2026-06-25T11:00:00Z',
  },
  {
    id: '4',
    username: 'wangwu',
    name: '王五',
    status: 'enabled',
    roles: [
      { id: '2', code: 'user', name: '普通用户', status: 'enabled' },
      { id: '3', code: 'operator', name: '操作员', status: 'enabled' },
    ],
    last_login_at: '2026-07-04T14:20:00Z',
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-07-04T14:20:00Z',
  },
  {
    id: '5',
    username: 'zhaoliu',
    name: '赵六',
    status: 'frozen',
    roles: [{ id: '2', code: 'user', name: '普通用户', status: 'enabled' }],
    last_login_at: '2026-06-15T08:00:00Z',
    created_at: '2026-05-20T00:00:00Z',
    updated_at: '2026-06-30T16:00:00Z',
  },
];

// ============ Mock 权限数据 ============
export const mockPermissions: PermissionItem[] = [
  // 用户管理权限
  { id: 'p1', code: 'user:list', name: '查看用户', resource: '用户管理', action: '查询' },
  { id: 'p2', code: 'user:create', name: '创建用户', resource: '用户管理', action: '创建' },
  { id: 'p3', code: 'user:update', name: '更新用户', resource: '用户管理', action: '更新' },
  { id: 'p4', code: 'user:delete', name: '删除用户', resource: '用户管理', action: '删除' },
  { id: 'p5', code: 'user:assign-role', name: '分配角色', resource: '用户管理', action: '分配' },
  // 角色管理权限
  { id: 'p6', code: 'role:list', name: '查看角色', resource: '角色管理', action: '查询' },
  { id: 'p7', code: 'role:create', name: '创建角色', resource: '角色管理', action: '创建' },
  { id: 'p8', code: 'role:update', name: '更新角色', resource: '角色管理', action: '更新' },
  { id: 'p9', code: 'role:delete', name: '删除角色', resource: '角色管理', action: '删除' },
  { id: 'p10', code: 'role:assign-permission', name: '分配权限', resource: '角色管理', action: '分配' },
  // 权限管理权限
  { id: 'p11', code: 'permission:list', name: '查看权限', resource: '权限管理', action: '查询' },
  // 菜单管理权限
  { id: 'p12', code: 'menu:list', name: '查看菜单', resource: '菜单管理', action: '查询' },
  { id: 'p13', code: 'menu:create', name: '创建菜单', resource: '菜单管理', action: '创建' },
  { id: 'p14', code: 'menu:update', name: '更新菜单', resource: '菜单管理', action: '更新' },
  { id: 'p15', code: 'menu:delete', name: '删除菜单', resource: '菜单管理', action: '删除' },
  // 标书管理权限
  { id: 'p16', code: 'tender:list', name: '查看标书', resource: '标书管理', action: '查询' },
  { id: 'p17', code: 'tender:create', name: '创建标书', resource: '标书管理', action: '创建' },
  { id: 'p18', code: 'tender:update', name: '更新标书', resource: '标书管理', action: '更新' },
  { id: 'p19', code: 'tender:delete', name: '删除标书', resource: '标书管理', action: '删除' },
  // 知识库权限
  { id: 'p20', code: 'kb:list', name: '查看知识库', resource: '知识库', action: '查询' },
  { id: 'p21', code: 'kb:upload', name: '上传文档', resource: '知识库', action: '上传' },
  { id: 'p22', code: 'kb:delete', name: '删除文档', resource: '知识库', action: '删除' },
];

// ============ Mock 菜单数据 ============
export const mockMenus: MenuItem[] = [
  {
    id: 'm1',
    name: '标书生成',
    route: '/technical-plan',
    icon: 'document',
    sort_order: 1,
    visible: true,
    permission_code: 'tender:list',
  },
  {
    id: 'm2',
    name: '知识库',
    route: '/knowledge-base',
    icon: 'archive',
    sort_order: 2,
    visible: true,
    permission_code: 'kb:list',
    children: [
      {
        id: 'm2-1',
        parent_id: 'm2',
        name: '文档知识库',
        route: '/document-knowledge-base',
        icon: 'file',
        sort_order: 1,
        visible: true,
        permission_code: 'kb:list',
      },
    ],
  },
  {
    id: 'm3',
    name: '匿名化工具',
    route: '/anonymous',
    icon: 'shield',
    sort_order: 3,
    visible: true,
  },
  {
    id: 'm4',
    name: '系统管理',
    route: '/profile/user-management',
    icon: 'settings',
    sort_order: 4,
    visible: true,
    children: [
      {
        id: 'm4-1',
        parent_id: 'm4',
        name: '用户管理',
        route: '/profile/user-management',
        icon: 'user',
        sort_order: 1,
        visible: true,
        permission_code: 'user:list',
      },
      {
        id: 'm4-2',
        parent_id: 'm4',
        name: '角色权限管理',
        route: '/profile/role-management',
        icon: 'shield',
        sort_order: 2,
        visible: true,
        permission_code: 'role:list',
      },
      {
        id: 'm4-3',
        parent_id: 'm4',
        name: '权限总览',
        route: '/profile/permission-overview',
        icon: 'key',
        sort_order: 3,
        visible: true,
        permission_code: 'permission:list',
      },
      {
        id: 'm4-4',
        parent_id: 'm4',
        name: '菜单管理',
        route: '/profile/menu-management',
        icon: 'menu',
        sort_order: 4,
        visible: true,
        permission_code: 'menu:list',
      },
    ],
  },
];

// ============ Mock 角色数据 ============
export const mockRoles: RoleItem[] = [
  {
    id: '1',
    code: 'admin',
    name: '系统管理员',
    status: 'enabled',
    permissions: mockPermissions,
    menus: mockMenus,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-07-01T00:00:00Z',
  },
  {
    id: '2',
    code: 'user',
    name: '普通用户',
    status: 'enabled',
    permissions: mockPermissions.filter((p) =>
      ['user:list', 'role:list', 'permission:list', 'tender:list', 'tender:create', 'kb:list', 'kb:upload'].includes(p.code)
    ),
    menus: mockMenus.filter((m) => ['m1', 'm2', 'm2-1', 'm3'].includes(m.id)),
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-06-15T00:00:00Z',
  },
  {
    id: '3',
    code: 'operator',
    name: '操作员',
    status: 'enabled',
    permissions: mockPermissions.filter((p) =>
      ['user:list', 'tender:list', 'tender:create', 'tender:update', 'kb:list', 'kb:upload'].includes(p.code)
    ),
    menus: mockMenus.filter((m) => ['m1', 'm2', 'm2-1'].includes(m.id)),
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
  },
];

// ============ 辅助函数 ============

// 模拟延迟
export const delay = (ms = 300) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// 模拟分页
export function paginateData<T>(data: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    items: data.slice(start, end),
    pagination: {
      page,
      page_size: pageSize,
      total: data.length,
    },
  };
}

// 模拟用户列表查询
export async function mockGetUsers(params: {
  page?: number;
  page_size?: number;
  keyword?: string;
  status?: string;
  role?: string;
}): Promise<{ items: UserItem[]; pagination: { page: number; page_size: number; total: number } }> {
  await delay();
  let filtered = [...mockUsers];

  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(
      (u) => u.username.toLowerCase().includes(kw) || u.name?.toLowerCase().includes(kw)
    );
  }

  if (params.status) {
    filtered = filtered.filter((u) => u.status === params.status);
  }

  if (params.role) {
    filtered = filtered.filter((u) => u.roles.some((r) => r.code === params.role));
  }

  return paginateData(filtered, params.page || 1, params.page_size || 20);
}

// 模拟角色列表查询
export async function mockGetRoles(params: {
  page?: number;
  page_size?: number;
  keyword?: string;
  status?: string;
}): Promise<{ items: RoleItem[]; pagination: { page: number; page_size: number; total: number } }> {
  await delay();
  let filtered = [...mockRoles];

  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(
      (r) => r.name.toLowerCase().includes(kw) || r.code.toLowerCase().includes(kw)
    );
  }

  if (params.status) {
    filtered = filtered.filter((r) => r.status === params.status);
  }

  return paginateData(filtered, params.page || 1, params.page_size || 20);
}

// 模拟获取权限列表
export async function mockGetPermissions(): Promise<PermissionItem[]> {
  await delay();
  return [...mockPermissions];
}

// 模拟获取菜单树
export async function mockGetMenus(): Promise<MenuItem[]> {
  await delay();
  return JSON.parse(JSON.stringify(mockMenus));
}
