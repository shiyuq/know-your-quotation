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
  authRegisterTenant = 'auth:registerTenant',
  leadinProduct = 'leadin:product',
  makeQuotation = 'make:quotation',
}

export const RolePermissions: Record<GlobalRole, string[]> = {
  [GlobalRole.PLATFORM_ADMIN]: [],
  [GlobalRole.BOSS]: [
    PermissonEnum.authSignIn,
    PermissonEnum.leadinProduct,
    PermissonEnum.makeQuotation,
  ],
  [GlobalRole.STAFF]: [PermissonEnum.authSignIn, PermissonEnum.makeQuotation],
};
