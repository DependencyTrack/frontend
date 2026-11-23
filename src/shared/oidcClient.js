import { ErrorResponse, UserManager } from 'oidc-client-ts';

export function createOidcClient({
  issuer,
  clientId,
  scope,
  flow,
  redirectUri,
}) {
  const settings = {
    authority: issuer,
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
  };
  return flow === 'implicit'
    ? new ImplicitFlowClient(settings)
    : new UserManager({
        ...settings,
        response_type: 'code',
        automaticSilentRenew: false,
      });
}

const REQUEST_KEY = 'oidc.implicit.request';
const USER_KEY = 'oidc.implicit.user';

class ImplicitFlowClient {
  constructor(settings) {
    this.settings = settings;
  }

  async signinRedirect({ state }) {
    const { authority, client_id, redirect_uri, scope } = this.settings;
    const response = await fetch(
      `${authority.replace(/\/$/, '')}/.well-known/openid-configuration`,
    );
    if (!response.ok) {
      throw new Error(`Discovery failed with ${response.status}`);
    }
    const { authorization_endpoint } = await response.json();

    const request = { id: randomString(), nonce: randomString(), data: state };
    sessionStorage.setItem(REQUEST_KEY, JSON.stringify(request));

    const url = new URL(authorization_endpoint);
    url.search = new URLSearchParams({
      client_id,
      redirect_uri,
      response_type: 'id_token token',
      scope,
      state: request.id,
      nonce: request.nonce,
    });
    window.location.assign(url);
  }

  async signinRedirectCallback(url = window.location.href) {
    const request = JSON.parse(sessionStorage.getItem(REQUEST_KEY));
    sessionStorage.removeItem(REQUEST_KEY);

    const params = new URLSearchParams(new URL(url).hash.slice(1));
    if (!request || params.get('state') !== request.id) {
      throw new Error('State does not match');
    }
    if (params.has('error')) {
      throw new ErrorResponse({
        error: params.get('error'),
        error_description: params.get('error_description'),
      });
    }
    const user = {
      access_token: params.get('access_token'),
      id_token: params.get('id_token'),
      state: request.data,
    };
    if (!user.access_token || !user.id_token) {
      throw new Error('Response is missing tokens');
    }
    // The API server validates the ID token, but not its nonce.
    if (decodeJwtPayload(user.id_token).nonce !== request.nonce) {
      throw new Error('Nonce does not match');
    }
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  }

  async getUser() {
    return JSON.parse(sessionStorage.getItem(USER_KEY));
  }

  async removeUser() {
    sessionStorage.removeItem(USER_KEY);
  }
}

function randomString() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function decodeJwtPayload(jwt) {
  const base64 = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}
