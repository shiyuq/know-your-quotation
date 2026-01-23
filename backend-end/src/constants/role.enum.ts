export enum Role {
  User = 'user',
  Admin = 'admin',
}

export enum GlobalRole {
  PLATFORM_ADMIN = 'platform_admin',
  BOSS = 'boss',
  STAFF = 'staff',
}

export enum PermissonEnum {
  authSignIn = 'auth:signIn',
  registerTenant = 'tenant:register',
  listTenant = 'tenant:list',
  detailTenant = 'tenant:detail',
  deleteTenant = 'tenant:delete',
  enableTenant = 'tenant:enable',
  updateTenant = 'tenant:update',
  leadinProduct = 'leadin:product',
  listProduct = 'list:product',
  listSku = 'list:sku',
  deleteSku = 'delete:sku',
  offlineSku = 'offline:sku',
  listProductSku = 'list:product:sku',
  makeQuotation = 'make:quotation',
}

// 员工权限
const STAFF_PERMISSIONS = [
  PermissonEnum.authSignIn,
  PermissonEnum.makeQuotation,
  PermissonEnum.listProduct,
  PermissonEnum.listSku,
  PermissonEnum.listProductSku,
  PermissonEnum.deleteSku,
  PermissonEnum.offlineSku,
];

// 老板权限
const BOSS_PERMISSIONS = [...STAFF_PERMISSIONS, PermissonEnum.leadinProduct];

// 平台管理员权限
const PLATFORM_ADMIN_PERMISSIONS = [
  ...BOSS_PERMISSIONS,
  PermissonEnum.registerTenant,
  PermissonEnum.listTenant,
  PermissonEnum.detailTenant,
  PermissonEnum.deleteTenant,
  PermissonEnum.enableTenant,
];

export const RolePermissions: Record<GlobalRole, PermissonEnum[]> = {
  [GlobalRole.PLATFORM_ADMIN]: PLATFORM_ADMIN_PERMISSIONS,
  [GlobalRole.BOSS]: BOSS_PERMISSIONS,
  [GlobalRole.STAFF]: STAFF_PERMISSIONS,
};
