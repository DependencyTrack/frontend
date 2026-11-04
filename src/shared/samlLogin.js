// Browser side of the SAML login flow. The API server talks to the identity provider,
// and redirects back to the /login/saml route with a one-time code. The code can only be
// exchanged together with the code verifier created here (RFC 7636), so a login cannot be
// completed in a browser other than the one that started it.

const CODE_VERIFIER_KEY = 'saml.codeVerifier';

function base64Url(bytes) {
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function codeChallengeOf(verifier) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier),
  );
  return base64Url(new Uint8Array(digest));
}

/**
 * Navigates the browser to the API server, which redirects it to the identity provider.
 *
 * @param {string} loginUrl URL of the API server's SAML login endpoint
 * @param {string|null} redirect Frontend path to return to after the login
 */
export async function startSamlLogin(loginUrl, redirect) {
  const verifier = base64Url(crypto.getRandomValues(new Uint8Array(32)));
  sessionStorage.setItem(CODE_VERIFIER_KEY, verifier);

  const params = new URLSearchParams({
    code_challenge: await codeChallengeOf(verifier),
  });
  if (redirect) {
    params.set('redirect', redirect);
  }
  window.location.assign(`${loginUrl}?${params}`);
}

/**
 * Returns the code verifier of the login in progress, and forgets it.
 *
 * @returns {string|null}
 */
export function takeSamlCodeVerifier() {
  const verifier = sessionStorage.getItem(CODE_VERIFIER_KEY);
  sessionStorage.removeItem(CODE_VERIFIER_KEY);
  return verifier;
}
