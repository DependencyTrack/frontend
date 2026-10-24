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
// Hydra's in-memory store fails concurrent authorization flows with a serialization error.
test.describe.configure({ mode: 'default' });

const REJECTION =
  'redirect_uri <https://dt.example/cb> is not registered & more';

for (const flow of ['code', 'implicit']) {
  test(`log in through OIDC (${flow} flow)`, async ({ page, api }) => {
    const username = uniqueName('e2e-oidc');
    await api.send('PUT', '/v1/user/oidc', { username });
    await api.send('POST', `/v1/permission/VIEW_PORTFOLIO/user/${username}`);
    await routeThroughHydra(page, flow, username);

    await page.goto('login');
    await page.getByRole('button', { name: 'OpenID Logo' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole('heading', { name: 'Portfolio Vulnerabilities' }),
    ).toBeVisible();

    // The callback must not stay in history, or Back replays it and reports a failed login.
    await page.goBack();
    await expect(page).toHaveURL(/\/login$/);
  });

  test(`show the IdP's error verbatim (${flow} flow)`, async ({ page }) => {
    await routeThroughHydra(page, flow, uniqueName('e2e-oidc'), {
      rejectLogin: {
        error: 'access_denied',
        error_description: `${REJECTION} <img src=x onerror='window.injected=true'>`,
      },
    });

    await page.goto('login');
    await page.getByRole('button', { name: 'OpenID Logo' }).click();
    await expect(page).toHaveURL(/\/login\?error=oidc$/);
    await expect(
      page.getByText(
        `OpenID Connect login failed (access_denied: ${REJECTION} <img src=x onerror='window.injected=true'>)`,
        { exact: true },
      ),
    ).toBeVisible();
    expect(await page.evaluate(() => window.injected)).toBeUndefined();

    await page.reload();
    await expect(
      page.getByText('OpenID Connect login failed', { exact: true }),
    ).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/login$/);
  });

  test(`reject OIDC callback with tampered state (${flow} flow)`, async ({
    page,
  }) => {
    // An IdP error, so the test also fails if the error is read before the state is checked.
    await routeThroughHydra(page, flow, uniqueName('e2e-oidc'), {
      rejectLogin: { error: 'access_denied', error_description: REJECTION },
      rewriteCallback: (url) => tamper(url, 'state'),
    });

    await page.goto('login');
    await page.getByRole('button', { name: 'OpenID Logo' }).click();
    await expect(page).toHaveURL(/\/login\?error=oidc$/);
    await expect(
      page.getByText('OpenID Connect login failed', { exact: true }),
    ).toBeVisible();
  });
}

test('reject OIDC callback with mismatched nonce (implicit flow)', async ({
  page,
}) => {
  await routeThroughHydra(page, 'implicit', uniqueName('e2e-oidc'), {
    rewriteRequest: (url) => tamper(url, 'nonce'),
  });

  await page.goto('login');
  await page.getByRole('button', { name: 'OpenID Logo' }).click();
  await expect(page).toHaveURL(/\/login\?error=oidc$/);
  await expect(
    page.getByText('OpenID Connect login failed', { exact: true }),
  ).toBeVisible();
});

test('ignore OIDC error details in the URL', async ({ page }) => {
  await page.goto(
    'login?error=oidc&oidc_error=account_locked&error_description=Call+support',
  );
  await expect(
    page.getByText('OpenID Connect login failed', { exact: true }),
  ).toBeVisible();
});

test('focus the username only after choosing more login options', async ({
  page,
}) => {
  await routeThroughHydra(page, 'code', uniqueName('e2e-oidc'));
  await page.goto('login');
  const more = page.getByRole('link', { name: 'More options' });
  await expect(more).toBeVisible();
  await expect(page.getByPlaceholder('Username')).toBeHidden();

  await more.click();
  await expect(page.getByPlaceholder('Username')).toBeFocused();
});

function tamper(url, param) {
  return new URL(
    url.href.replace(new RegExp(`([?#&]${param}=)[^&]+`), '$1tampered'),
  );
}

async function routeThroughHydra(
  page,
  flow,
  username,
  {
    rewriteRequest = (url) => url,
    rewriteCallback = (url) => url,
    rejectLogin,
  } = {},
) {
  await page.route('**/static/config.json', (route) =>
    route.fulfill({
      json: {
        API_BASE_URL: '',
        OIDC_ISSUER: 'http://hydra:4444',
        OIDC_CLIENT_ID,
        OIDC_SCOPE: 'openid profile email',
        OIDC_FLOW: flow,
      },
    }),
  );
  // Hydra has no login UI, and route handlers don't see redirects, so follow them here and accept Hydra's challenges.
  await page.route(
    (url) => url.href.startsWith('http://hydra:4444/oauth2/auth'),
    async (route) => {
      let url = rewriteRequest(new URL(route.request().url()));
      while (url.origin !== APP_URL) {
        if (url.hostname === 'login.e2e.invalid') {
          url = new URL(
            url.pathname === '/login'
              ? rejectLogin
                ? await answer(
                    'login',
                    'reject',
                    url.searchParams.get('login_challenge'),
                    rejectLogin,
                  )
                : await answer(
                    'login',
                    'accept',
                    url.searchParams.get('login_challenge'),
                    { subject: username },
                  )
              : await answer(
                  'consent',
                  'accept',
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
      await route.fulfill({
        status: 302,
        headers: { location: rewriteCallback(url).href },
      });
    },
  );
}

async function answer(flow, action, challenge, body) {
  const res = await fetch(
    `${HYDRA_ADMIN_URL}/oauth2/auth/requests/${flow}/${action}?${flow}_challenge=${challenge}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    throw new Error(
      `Answering the ${flow} challenge with ${action} failed with ${res.status}: ${await res.text()}`,
    );
  }
  return (await res.json()).redirect_to;
}
