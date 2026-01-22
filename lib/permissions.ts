/**
 * Role-Based Access Control (RBAC) System
 * Enhanced permissions for different user roles
 */

export enum UserRole {
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  CONTRIBUTOR = "CONTRIBUTOR",
  USER = "USER",
}

export enum Permission {
  // Tool permissions
  CREATE_TOOL = "CREATE_TOOL",
  EDIT_TOOL = "EDIT_TOOL",
  DELETE_TOOL = "DELETE_TOOL",
  PUBLISH_TOOL = "PUBLISH_TOOL",
  
  // Course permissions
  CREATE_COURSE = "CREATE_COURSE",
  EDIT_COURSE = "EDIT_COURSE",
  DELETE_COURSE = "DELETE_COURSE",
  PUBLISH_COURSE = "PUBLISH_COURSE",
  
  // Post permissions
  CREATE_POST = "CREATE_POST",
  EDIT_POST = "EDIT_POST",
  DELETE_POST = "DELETE_POST",
  PUBLISH_POST = "PUBLISH_POST",
  
  // Category permissions
  CREATE_CATEGORY = "CREATE_CATEGORY",
  EDIT_CATEGORY = "EDIT_CATEGORY",
  DELETE_CATEGORY = "DELETE_CATEGORY",
  
  // User management
  MANAGE_USERS = "MANAGE_USERS",
  MANAGE_ROLES = "MANAGE_ROLES",
  
  // Settings
  MANAGE_SETTINGS = "MANAGE_SETTINGS",
  VIEW_ANALYTICS = "VIEW_ANALYTICS",
  EXPORT_DATA = "EXPORT_DATA",
  
  // Content moderation
  MODERATE_CONTENT = "MODERATE_CONTENT",
  APPROVE_CONTENT = "APPROVE_CONTENT",
}

// Role-Permission mapping
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Full access to everything
    ...Object.values(Permission),
  ],
  
  [UserRole.EDITOR]: [
    // Can create, edit, and publish content
    Permission.CREATE_TOOL,
    Permission.EDIT_TOOL,
    Permission.PUBLISH_TOOL,
    Permission.CREATE_COURSE,
    Permission.EDIT_COURSE,
    Permission.PUBLISH_COURSE,
    Permission.CREATE_POST,
    Permission.EDIT_POST,
    Permission.PUBLISH_POST,
    Permission.CREATE_CATEGORY,
    Permission.EDIT_CATEGORY,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_DATA,
    Permission.MODERATE_CONTENT,
  ],
  
  [UserRole.CONTRIBUTOR]: [
    // Can create and edit their own content (requires approval)
    Permission.CREATE_TOOL,
    Permission.EDIT_TOOL,
    Permission.CREATE_POST,
    Permission.EDIT_POST,
    Permission.CREATE_COURSE,
    Permission.EDIT_COURSE,
  ],
  
  [UserRole.USER]: [
    // View-only access
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) || false;
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role] || [];
}

/**
 * Check if user can perform action on resource
 */
export function canPerformAction(
  role: UserRole,
  action: Permission,
  resourceOwnerId?: string,
  userId?: string
): boolean {
  // Admins can do anything
  if (role === UserRole.ADMIN) {
    return true;
  }

  // Check if role has the permission
  if (!hasPermission(role, action)) {
    return false;
  }

  // For contributors, check if they own the resource
  if (role === UserRole.CONTRIBUTOR) {
    return resourceOwnerId === userId;
  }

  return true;
}

/**
 * Middleware helper for API routes
 */
export function requirePermission(permission: Permission) {
  return (role: UserRole) => {
    if (!hasPermission(role, permission)) {
      throw new Error(`Insufficient permissions: ${permission} required`);
    }
  };
}

// Role hierarchy (higher number = more privileges)
export const roleHierarchy: Record<UserRole, number> = {
  [UserRole.USER]: 0,
  [UserRole.CONTRIBUTOR]: 1,
  [UserRole.EDITOR]: 2,
  [UserRole.ADMIN]: 3,
};

/**
 * Check if one role is higher than another
 */
export function isRoleHigher(role1: UserRole, role2: UserRole): boolean {
  return roleHierarchy[role1] > roleHierarchy[role2];
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const names = {
    [UserRole.ADMIN]: "Administrator",
    [UserRole.EDITOR]: "Editor",
    [UserRole.CONTRIBUTOR]: "Contributor",
    [UserRole.USER]: "User",
  };
  return names[role];
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions = {
    [UserRole.ADMIN]: "Full system access with all permissions",
    [UserRole.EDITOR]: "Can create, edit, and publish all content",
    [UserRole.CONTRIBUTOR]: "Can create and edit their own content",
    [UserRole.USER]: "Can view published content and manage bookmarks",
  };
  return descriptions[role];
}
