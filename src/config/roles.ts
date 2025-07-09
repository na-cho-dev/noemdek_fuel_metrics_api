export enum Roles {
  ADMIN = "admin",
  ANALYST = "analyst",
  VIEWER = "viewer",
}

export const RolePermissions: Record<Roles, string[]> = {
  [Roles.ADMIN]: ["read:data", "write:data", "delete:data", "manage:users"],
  [Roles.ANALYST]: ["read:data", "write:data"],
  [Roles.VIEWER]: ["read:data"],
};
