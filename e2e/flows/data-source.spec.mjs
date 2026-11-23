import { uniqueName } from '../api.mjs';
import { test, expect, login } from '../test.mjs';

const configPath =
  '/v2/extension-points/vuln-data-source/extensions/osv/config';

test('change and save a data source config form', async ({
  page,
  api,
  problems,
}) => {
  problems.allow(
    /^GET \/api\/v2\/vuln-data-sources\/osv\/mirror-runs\/latest 404$/,
  );
  const { config: original } = await api.get(configPath);
  await api.send('PUT', configPath, {
    config: { ...original, aliasSyncEnabled: false, ecosystems: ['npm'] },
  });
  const dataUrl = `https://${uniqueName('osv')}.example.com`;
  try {
    await login(page);
    await page.goto('admin/vulnerabilitySources/osv');
    await page.getByText('Alias Synchronization Enabled').click();
    await page.getByLabel('Data URL').fill(dataUrl);
    await page.getByRole('button', { name: 'Add Ecosystem' }).click();
    await page.getByRole('textbox').last().fill('Maven');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Record updated successfully')).toBeVisible();

    const { config } = await api.get(configPath);
    expect(config).toMatchObject({
      aliasSyncEnabled: true,
      dataUrl,
      ecosystems: ['npm', 'Maven'],
    });
  } finally {
    await api.send('PUT', configPath, { config: original });
  }
});
