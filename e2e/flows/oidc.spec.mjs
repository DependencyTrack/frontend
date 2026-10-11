import {
  APP_URL,
  HYDRA_ADMIN_URL,
  OIDC_CLIENT_ID,
  uniqueName,
} from '../api.mjs';
import { test, expect } from '../test.mjs';

// The issuer must be the same URL for the browser and the API server, which reaches Hydra as hydra:4444.
test.use({
  launchOptions: { args: ['--host-resolver-rules=MAP hydra 127.0.0.1'] },
});

test('log in through OIDC', async ({ page, api }) => {
  const username = uniqueName('e2e-oidc');
  await api.send('PUT', '/v1/user/oidc', { username });
  await api.send('POST', `/v1/permission/VIEW_PORTFOLIO/user/${username}`);

  await page.route('**/static/config.json', (route) =>
    route.fulfill({
      json: {
        API_BASE_URL: '',
        OIDC_ISSUER: 'http://hydra:4444',
        OIDC_CLIENT_ID,
        OIDC_SCOPE: 'openid profile email',
        OIDC_FLOW: 'code',
      },
    }),
  );
  // Hydra has no login UI, and route handlers don't see redirects, so follow them here and accept Hydra's challenges.
  await page.route(
    (url) => url.href.startsWith('http://hydra:4444/oauth2/auth'),
    async (route) => {
      let url = new URL(route.request().url());
      while (url.origin !== APP_URL) {
        if (url.hostname === 'login.e2e.invalid') {
          url = new URL(
            url.pathname === '/login'
              ? await accept('login', url.searchParams.get('login_challenge'), {
                  subject: username,
                })
              : await accept(
                  'consent',
                  url.searchParams.get('consent_challenge'),
                  {
                    grant_scope: ['openid', 'profile', 'email'],
                    session: { id_token: { preferred_username: username } },
                  },
                ),
          );
        } else {
          url.host = '127.0.0.1:4444';
          const res = await route.fetch({ url: url.href, maxRedirects: 0 });
          if (res.status() < 300 || res.status() >= 400) {
            throw new Error(
              `Hydra answered ${url.pathname} with ${res.status()}: ${await res.text()}`,
            );
          }
          url = new URL(res.headers().location, url);
        }
      }
      await route.fulfill({ status: 302, headers: { location: url.href } });
    },
  );

  await page.goto('login');
  await page.getByRole('button', { name: 'OpenID Logo' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole('heading', { name: 'Portfolio Vulnerabilities' }),
  ).toBeVisible();
});

async function accept(flow, challenge, body) {
  const res = await fetch(
    `${HYDRA_ADMIN_URL}/oauth2/auth/requests/${flow}/accept?${flow}_challenge=${challenge}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    throw new Error(
      `Accepting the ${flow} challenge failed with ${res.status}: ${await res.text()}`,
    );
  }
  return (await res.json()).redirect_to;
}
