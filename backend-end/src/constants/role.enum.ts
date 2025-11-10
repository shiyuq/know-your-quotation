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
}

export const RolePermissions: Record<GlobalRole, string[]> = {
  [GlobalRole.PLATFORM_ADMIN]: [],
  [GlobalRole.BOSS]: ['auth:signIn'],
  [GlobalRole.STAFF]: ['auth:signIn'],
};
