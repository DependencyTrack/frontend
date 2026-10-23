import { request } from '@playwright/test';

export const APP_URL = 'http://127.0.0.1:18081';
export const API_URL = 'http://127.0.0.1:18080';
export const HYDRA_ADMIN_URL = 'http://127.0.0.1:4445/admin';
export const OIDC_CLIENT_ID = 'dtrack-e2e';
export const HEALTH_URL = 'http://127.0.0.1:19000/health';
export const ADMIN_PASSWORD = 'admin123';

export function seed() {
  return JSON.parse(process.env.E2E_SEED);
}

export function uniqueName(prefix) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export class Api {
  #ctx;

  constructor(ctx) {
    this.#ctx = ctx;
  }

  static async login(username = 'admin', password = ADMIN_PASSWORD) {
    const anonymous = await request.newContext({ baseURL: API_URL });
    const res = await anonymous.post('/api/v1/user/login', {
      form: { username, password },
    });
    await ok(res, 'login');
    const token = await res.text();
    await anonymous.dispose();
    return new Api(
      await request.newContext({
        baseURL: API_URL,
        extraHTTPHeaders: { Authorization: `Bearer ${token}` },
      }),
    );
  }

  get(path) {
    return this.send('GET', path);
  }

  async send(method, path, data) {
    const res = await this.#ctx.fetch(`/api${path}`, { method, data });
    await ok(res, `${method} ${path}`);
    const body = await res.text();
    return body ? JSON.parse(body) : undefined;
  }

  dispose() {
    return this.#ctx.dispose();
  }
}

async function ok(res, what) {
  if (!res.ok()) {
    throw new Error(`${what} failed with ${res.status()}: ${await res.text()}`);
  }
}
