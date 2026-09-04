import Oidc from 'oidc-client';
import Vue from 'vue';
import { getContextPath } from './utils';

/**
 * Key under which the ID token of the current session is recorded, if that
 * session was established via OIDC.
 *
 * Neither of the obvious alternatives works at logout time:
 *   - /api/v1/user/self does not expose the principal type. Managed users can
 *     be identified by the presence of `suspended`, but LDAP users are
 *     indistinguishable from OIDC users that way.
 *   - UserManager.getUser() returns null, because the OIDC user is removed
 *     from the web storage right after the token exchange (see Login.vue).
 */
const OIDC_SESSION_KEY = 'oidcSession';

let userManager = null;

/**
 * Whether the frontend is configured for OIDC.
 */
export function isOidcConfigured() {
  const oidc = Vue.prototype.$oidc;
  return Boolean(oidc && oidc.ISSUER && oidc.CLIENT_ID && oidc.SCOPE);
}

/**
 * Lazily creates the shared UserManager. Returns null when OIDC is not
 * configured, so callers can fall back to local-only behavior.
 */
export function getOidcUserManager() {
  if (userManager !== null) {
    return userManager;
  }
  if (!isOidcConfigured()) {
    return null;
  }

  const oidc = Vue.prototype.$oidc;
  const baseUrl = `${window.location.origin}${getContextPath()}`;

  userManager = new Oidc.UserManager({
    userStore: new Oidc.WebStorageStateStore(),
    authority: oidc.ISSUER,
    client_id: oidc.CLIENT_ID,
    redirect_uri: `${baseUrl}/static/oidc-callback.html`,
    post_logout_redirect_uri: baseUrl,
    response_type: oidc.FLOW === 'implicit' ? 'token id_token' : 'code',
    scope: oidc.SCOPE,
    loadUserInfo: false,
  });

  return userManager;
}

/**
 * Records that the current session was established via OIDC, retaining the ID
 * token for use as id_token_hint during RP-Initiated Logout.
 */
export function markOidcSession(idToken) {
  sessionStorage.setItem(OIDC_SESSION_KEY, idToken || '');
}

/**
 * Whether the current session was established via OIDC.
 */
export function isOidcSession() {
  return sessionStorage.getItem(OIDC_SESSION_KEY) !== null;
}

/**
 * Clears the recorded OIDC session and returns the retained ID token, or null
 * if the current session was not established via OIDC.
 */
export function clearOidcSession() {
  const idToken = sessionStorage.getItem(OIDC_SESSION_KEY);
  sessionStorage.removeItem(OIDC_SESSION_KEY);
  return idToken === null ? null : idToken;
}
