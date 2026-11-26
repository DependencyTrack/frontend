import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/i18n', () => ({ default: {} }));
vi.mock('@/plugins/toastr', () => ({ toastr: {} }));

import { getRedirectUrl } from '@/shared/utils';
import Login from './Login.vue';

const ORIGIN = 'https://dt.example.com';

function stubLocation(pathname) {
  vi.stubGlobal('window', { location: { origin: ORIGIN, pathname } });
}

function routerWithRedirect(redirect) {
  return {
    currentRoute: {
      value: {
        query: redirect === undefined ? {} : { redirect },
      },
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getRedirectUrl (root context)', () => {
  it.each([
    '/projects/0b1c2d3e-0000-0000-0000-000000000000?tab=overview#deps',
    '/dashboard',
  ])('returns router path %s', (redirect) => {
    stubLocation('/login');
    expect(getRedirectUrl(routerWithRedirect(redirect))).toBe(redirect);
  });

  it.each([
    ['missing redirect', undefined],
    ['non-string query array', ['/dashboard', '//evil.example']],
    ['protocol-relative URL', '//evil.example/dashboard'],
    ['external URL', 'https://evil.example/dashboard'],
    ['unknown root', '/evil'],
  ])('returns undefined for %s', (_description, redirect) => {
    stubLocation('/login');
    expect(getRedirectUrl(routerWithRedirect(redirect))).toBeUndefined();
  });
});

describe('getRedirectUrl (non-root context)', () => {
  it.each([
    '/projects/0b1c2d3e-0000-0000-0000-000000000000',
    '/projects?tag=prod#list',
    '/dashboard',
  ])(
    'returns router-relative path %s without prepending context',
    (redirect) => {
      stubLocation('/dtrack/login');
      expect(getRedirectUrl(routerWithRedirect(redirect))).toBe(redirect);
    },
  );

  it.each([
    [
      'already context-prefixed path',
      '/dtrack/projects/0b1c2d3e-0000-0000-0000-000000000000',
    ],
    ['non-string query array', ['/dashboard', 'x']],
    ['protocol-relative URL', '//evil.example/dashboard'],
    ['external URL', 'https://evil.example/dtrack/dashboard'],
    ['unknown root', '/evil'],
    ['javascript scheme', 'javascript:alert(1)'],
  ])('returns undefined for %s', (_description, redirect) => {
    stubLocation('/dtrack/login');
    expect(getRedirectUrl(routerWithRedirect(redirect))).toBeUndefined();
  });
});

describe('Login.methods.oidcLogin', () => {
  function createLoginContext(redirect) {
    const signinRedirect = vi.fn().mockResolvedValue();
    return {
      signinRedirect,
      ctx: {
        $router: routerWithRedirect(redirect),
        $toastr: { e: vi.fn() },
        $t: vi.fn((key) => key),
        oidcUserManager: { signinRedirect },
      },
    };
  }

  it('includes the context path in OIDC state under a non-root context', () => {
    stubLocation('/dtrack/login');
    const redirect = '/projects/0b1c2d3e-0000-0000-0000-000000000000';
    const { ctx, signinRedirect } = createLoginContext(redirect);

    Login.methods.oidcLogin.call(ctx);

    expect(signinRedirect).toHaveBeenCalledWith({
      state: `/dtrack${redirect}`,
    });
  });

  it('passes the router path as OIDC state under the root context', () => {
    stubLocation('/login');
    const redirect = '/projects/0b1c2d3e-0000-0000-0000-000000000000';
    const { ctx, signinRedirect } = createLoginContext(redirect);

    Login.methods.oidcLogin.call(ctx);

    expect(signinRedirect).toHaveBeenCalledWith({
      state: redirect,
    });
  });

  it.each([
    ['missing redirect', undefined],
    ['unsafe redirect', '//evil.example/dashboard'],
  ])('passes undefined state for %s under non-root context', (_d, redirect) => {
    stubLocation('/dtrack/login');
    const { ctx, signinRedirect } = createLoginContext(redirect);

    Login.methods.oidcLogin.call(ctx);

    expect(signinRedirect).toHaveBeenCalledWith({
      state: undefined,
    });
  });
});
