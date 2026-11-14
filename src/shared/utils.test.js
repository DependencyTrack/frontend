import { afterEach, describe, expect, it, vi } from 'vitest';

// utils.js pulls in the i18n instance and the toastr plugin, which touch
// localStorage/navigator at import time and are irrelevant to these tests.
vi.mock('@/i18n', () => ({ default: {} }));
vi.mock('@/plugins/toastr', () => ({ toastr: {} }));

import { getContextPath, isUrlSaveForRedirect } from './utils';

const ORIGIN = 'https://dt.example.com';

function stubLocation(pathname) {
  vi.stubGlobal('window', { location: { origin: ORIGIN, pathname } });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('isUrlSaveForRedirect (app deployed in the root context)', () => {
  const rootContextPathnames = ['/login', '/dashboard', '/projects'];

  it.each(rootContextPathnames)(
    'derives an empty context path from %s',
    (pathname) => {
      stubLocation(pathname);
      expect(getContextPath()).toBe('');
    },
  );

  it.each([
    '/dashboard',
    '/projects',
    '/projects/?tag=foo',
    '/project/0b1c2d3e-0000-0000-0000-000000000000',
    '/components',
    '/services',
    '/vulnerabilities',
    '/licenses',
    '/policy',
    '/admin/configuration',
    '/vulnerabilityAudit',
    '/policyViolationAudit',
    '/dashboard#fragment',
    // Intentionally allowed by the code: /login and /change-password are part
    // of acceptableRootContextPaths.
    '/login',
    '/change-password',
  ])('allows the same-origin path %s', (redirectUrl) => {
    stubLocation('/login');
    expect(isUrlSaveForRedirect(redirectUrl)).toBe(true);
  });

  it.each([
    ['absolute other-origin URL', 'https://evil.example/dashboard'],
    [
      'other-origin URL with a root path prefix in userinfo',
      'https://dt.example.com@evil.example/dashboard',
    ],
    ['other scheme, same host', 'http://dt.example.com/dashboard'],
    ['protocol-relative URL', '//evil.example'],
    ['protocol-relative URL with allowed path', '//evil.example/dashboard'],
    ['backslash after slash', '/\\evil.example'],
    ['double backslash', '\\\\evil.example'],
    ['single backslash', '\\evil.example'],
    ['javascript scheme', 'javascript:alert(1)'],
    ['uppercase javascript scheme', 'JaVaScRiPt:alert(1)'],
    ['data scheme', 'data:text/html,<script>alert(1)</script>'],
    ['blob scheme', 'blob:https://evil.example/uuid'],
    ['blob scheme wrapping own origin', `blob:${ORIGIN}/uuid`],
    ['file scheme', 'file:///etc/passwd'],
    ['root path', '/'],
    ['path outside the allowed roots', '/evil'],
    ['path outside the allowed roots (api)', '/api/v1/user/self'],
    ['relative path', 'dashboard'],
    ['encoded protocol-relative URL', '%2F%2Fevil.example'],
    ['encoded backslash', '/%5Cevil.example'],
    ['encoded slash prefix', '%2Fdashboard'],
    ['leading space', ' /dashboard'],
    ['leading tab', '\t/dashboard'],
    ['leading newline', '\n//evil.example'],
    ['leading carriage return', '\r/dashboard'],
    ['leading null byte', '\0/dashboard'],
    ['whitespace inside protocol-relative prefix', '/\t/evil.example'],
    ['newline inside protocol-relative prefix', '/\n/evil.example'],
    ['empty string', ''],
    ['whitespace only', '   '],
    // Absolute URLs are rejected even when same-origin, because the check
    // is prefix based on the raw input.
    ['same-origin absolute URL', `${ORIGIN}/dashboard`],
  ])('rejects %s', (_description, redirectUrl) => {
    stubLocation('/login');
    expect(isUrlSaveForRedirect(redirectUrl)).toBe(false);
  });

  it.each([undefined, null])('rejects %s', (redirectUrl) => {
    stubLocation('/login');
    expect(isUrlSaveForRedirect(redirectUrl)).toBe(false);
  });

  it.each([123, {}, []])('rejects non-string input %j', (redirectUrl) => {
    stubLocation('/login');
    expect(isUrlSaveForRedirect(redirectUrl)).toBe(false);
  });
});

describe('isUrlSaveForRedirect (app deployed in a non-root context)', () => {
  it('derives the context path from the current location', () => {
    stubLocation('/dtrack/login');
    expect(getContextPath()).toBe('/dtrack');
  });

  it.each(['/dtrack/dashboard', '/dtrack/projects?tag=foo', '/dtrack/login'])(
    'allows %s',
    (redirectUrl) => {
      stubLocation('/dtrack/login');
      expect(isUrlSaveForRedirect(redirectUrl)).toBe(true);
    },
  );

  it.each([
    ['root path without the context', '/dashboard'],
    ['other context', '/other/dashboard'],
    ['context without an allowed root', '/dtrack'],
    ['context with an unknown root', '/dtrack/evil'],
    ['protocol-relative URL', '//evil.example/dtrack/dashboard'],
    ['absolute other-origin URL', 'https://evil.example/dtrack/dashboard'],
    ['backslash variant', '/dtrack\\..\\evil'],
    ['javascript scheme', 'javascript:alert(1)'],
  ])('rejects %s', (_description, redirectUrl) => {
    stubLocation('/dtrack/login');
    expect(isUrlSaveForRedirect(redirectUrl)).toBe(false);
  });
});

// The origin and protocol checks are defence in depth: for a plain root or
// context path deployment, any input that passes the prefix check already
// resolves to a same-origin http(s) URL. These cases pin the checks down by
// making the prefix check pass for a URL that would otherwise be unsafe.
describe('isUrlSaveForRedirect (defence in depth)', () => {
  it('rejects a URL that matches the prefix check but resolves to another origin', () => {
    // A context path derived from a pathname starting with "//" turns the
    // prefix "//evil.example/dashboard" into a protocol-relative URL.
    stubLocation('//evil.example/login');
    expect(getContextPath()).toBe('//evil.example');
    expect(isUrlSaveForRedirect('//evil.example/dashboard')).toBe(false);
  });

  it('rejects redirects when the app itself is not served over http(s)', () => {
    vi.stubGlobal('window', {
      location: { origin: 'ftp://dt.example.com', pathname: '/login' },
    });
    expect(isUrlSaveForRedirect('/dashboard')).toBe(false);
  });
});
