// API Permissions
export const BOM_UPLOAD = "BOM_UPLOAD";
export const VIEW_PORTFOLIO = "VIEW_PORTFOLIO";
export const PORTFOLIO_MANAGEMENT = "PORTFOLIO_MANAGEMENT";
export const ACCESS_MANAGEMENT = "ACCESS_MANAGEMENT";
export const VIEW_VULNERABILITY = "VIEW_VULNERABILITY";
export const VULNERABILITY_ANALYSIS = "VULNERABILITY_ANALYSIS";
export const VULNERABILITY_MANAGEMENT = "VULNERABILITY_MANAGEMENT";
export const POLICY_VIOLATION_ANALYSIS = "POLICY_VIOLATION_ANALYSIS";
export const SYSTEM_CONFIGURATION = "SYSTEM_CONFIGURATION";
export const POLICY_MANAGEMENT = "POLICY_MANAGEMENT";

/**
 * Determines if the current logged in user has a specific permission.
 * If the decodedToken is not passed, the function will automatically
 * retrieve and decode it.
 */
export const hasPermission = function hasPermission(permission, decodedToken) {
  let token = decodedToken;
  if (!decodedToken) {
    token = decodeToken(getToken());
  }
  if (token !== null && Object.prototype.hasOwnProperty.call(token, "permissions")) {
    let permissions = token.permissions.split(",");
    for (let i = 0; i < permissions.length; i++) {
      if (permissions[i] === permission) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Returns the decoded token as a JSON object.
 */
export const decodeToken = function decodeToken(token) {
  let base64Url = token.split('.')[1];
  let base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(window.atob(base64));
};

/**
 * Retrieves the token from session storage.
 */
export const getToken = function getToken() {
  return sessionStorage.getItem("token");
};
