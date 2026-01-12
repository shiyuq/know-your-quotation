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

export const RolePermissions: Record<GlobalRole, string[]> = {
  [GlobalRole.PLATFORM_ADMIN]: [
    PermissonEnum.authSignIn,
    PermissonEnum.registerTenant,
    PermissonEnum.listTenant,
    PermissonEnum.detailTenant,
    PermissonEnum.deleteTenant,
    PermissonEnum.enableTenant,
    PermissonEnum.updateTenant,
  ],
  [GlobalRole.BOSS]: [
    PermissonEnum.authSignIn,
    PermissonEnum.leadinProduct,
    PermissonEnum.makeQuotation,
    PermissonEnum.listProduct,
    PermissonEnum.listSku,
    PermissonEnum.listProductSku,
    PermissonEnum.deleteSku,
    PermissonEnum.offlineSku,
  ],
  [GlobalRole.STAFF]: [
    PermissonEnum.authSignIn,
    PermissonEnum.makeQuotation,
    PermissonEnum.listProduct,
    PermissonEnum.listSku,
    PermissonEnum.listProductSku,
    PermissonEnum.deleteSku,
    PermissonEnum.offlineSku,
  ],
};
