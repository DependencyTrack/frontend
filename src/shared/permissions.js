/* eslint-disable prettier/prettier */
// API Permissions
export const BOM_UPLOAD = 'BOM_UPLOAD';
export const VIEW_PORTFOLIO = 'VIEW_PORTFOLIO';
export const PORTFOLIO_MANAGEMENT = 'PORTFOLIO_MANAGEMENT';
export const PORTFOLIO_MANAGEMENT_CREATE = 'PORTFOLIO_MANAGEMENT_CREATE';
export const PORTFOLIO_MANAGEMENT_READ = 'PORTFOLIO_MANAGEMENT_READ';
export const PORTFOLIO_MANAGEMENT_UPDATE = 'PORTFOLIO_MANAGEMENT_UPDATE';
export const PORTFOLIO_MANAGEMENT_DELETE = 'PORTFOLIO_MANAGEMENT_DELETE';
export const VIEW_VULNERABILITY = 'VIEW_VULNERABILITY';
export const VULNERABILITY_ANALYSIS = 'VULNERABILITY_ANALYSIS';
export const VULNERABILITY_ANALYSIS_CREATE = 'VULNERABILITY_ANALYSIS_CREATE';
export const VULNERABILITY_ANALYSIS_READ = 'VULNERABILITY_ANALYSIS_READ';
export const VULNERABILITY_ANALYSIS_UPDATE = 'VULNERABILITY_ANALYSIS_UPDATE';
export const VIEW_POLICY_VIOLATION = 'VIEW_POLICY_VIOLATION';
export const VULNERABILITY_MANAGEMENT = 'VULNERABILITY_MANAGEMENT';
export const VULNERABILITY_MANAGEMENT_CREATE =
  'VULNERABILITY_MANAGEMENT_CREATE';
export const VULNERABILITY_MANAGEMENT_READ = 'VULNERABILITY_MANAGEMENT_READ';
export const VULNERABILITY_MANAGEMENT_UPDATE =
  'VULNERABILITY_MANAGEMENT_UPDATE';
export const VULNERABILITY_MANAGEMENT_DELETE =
  'VULNERABILITY_MANAGEMENT_DELETE';
export const POLICY_VIOLATION_ANALYSIS = 'POLICY_VIOLATION_ANALYSIS';
export const ACCESS_MANAGEMENT = 'ACCESS_MANAGEMENT';
export const ACCESS_MANAGEMENT_CREATE = 'ACCESS_MANAGEMENT_CREATE';
export const ACCESS_MANAGEMENT_READ = 'ACCESS_MANAGEMENT_READ';
export const ACCESS_MANAGEMENT_UPDATE = 'ACCESS_MANAGEMENT_UPDATE';
export const ACCESS_MANAGEMENT_DELETE = 'ACCESS_MANAGEMENT_DELETE';
export const SECRET_MANAGEMENT = 'SECRET_MANAGEMENT';
export const SECRET_MANAGEMENT_CREATE = 'SECRET_MANAGEMENT_CREATE';
export const SECRET_MANAGEMENT_UPDATE = 'SECRET_MANAGEMENT_UPDATE';
export const SECRET_MANAGEMENT_DELETE = 'SECRET_MANAGEMENT_DELETE';
export const SYSTEM_CONFIGURATION = 'SYSTEM_CONFIGURATION';
export const SYSTEM_CONFIGURATION_CREATE = 'SYSTEM_CONFIGURATION_CREATE';
export const SYSTEM_CONFIGURATION_READ = 'SYSTEM_CONFIGURATION_READ';
export const SYSTEM_CONFIGURATION_UPDATE = 'SYSTEM_CONFIGURATION_UPDATE';
export const SYSTEM_CONFIGURATION_DELETE = 'SYSTEM_CONFIGURATION_DELETE';
export const PROJECT_CREATION_UPLOAD = 'PROJECT_CREATION_UPLOAD';
export const POLICY_MANAGEMENT = 'POLICY_MANAGEMENT';
export const POLICY_MANAGEMENT_CREATE = 'POLICY_MANAGEMENT_CREATE';
export const POLICY_MANAGEMENT_READ = 'POLICY_MANAGEMENT_READ';
export const POLICY_MANAGEMENT_UPDATE = 'POLICY_MANAGEMENT_UPDATE';
export const POLICY_MANAGEMENT_DELETE = 'POLICY_MANAGEMENT_DELETE';
export const TAG_MANAGEMENT = 'TAG_MANAGEMENT';
export const TAG_MANAGEMENT_DELETE = 'TAG_MANAGEMENT_DELETE';

/**
 * Determines if the current logged in user has a specific permission.
 */
export const hasPermission = function hasPermission(permission) {
  const permissions = getPermissions();
  if (typeof permission == 'string') {
    return permissions.includes(permission);
  } else if (Array.isArray(permission)) {
    for (let perm of permission) {
      if (permissions.includes(perm)) {
        return true;
      }
    }
    return false;
  }
};

/**
 * Stores the effective permissions array in session storage.
 */
export const storePermissions = function storePermissions(permissions) {
  if (!Array.isArray(permissions)) {
    return;
  }
  sessionStorage.setItem('permissions', JSON.stringify(permissions));
};

/**
 * Retrieves the cached permissions from session storage.
 */
export const getPermissions = function getPermissions() {
  try {
    const stored = sessionStorage.getItem('permissions');
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

/**
 * Clears the cached permissions from session storage.
 */
export const clearPermissions = function clearPermissions() {
  sessionStorage.removeItem('permissions');
};

/**
 * Retrieves the token from session storage.
 */
export const getToken = function getToken() {
  return sessionStorage.getItem('token');
};
