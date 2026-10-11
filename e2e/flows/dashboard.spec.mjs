import { test, expect, login } from '../test.mjs';

test('dashboard charts show the seeded metrics', async ({ page }) => {
  await login(page);
  await expect(
    page.getByRole('heading', { name: 'Portfolio Vulnerabilities' }),
  ).toBeVisible();
  // eslint-disable-next-line playwright/no-networkidle -- all() doesn't wait, so let every chart mount first.
  await page.waitForLoadState('networkidle');
  const canvases = page.locator('canvas');
  await expect(canvases).not.toHaveCount(0);
  for (const canvas of await canvases.all()) {
    await expect.poll(() => canvas.evaluate(isDrawn)).toBe(true);
  }
});

function isDrawn(canvas) {
  const { data } = canvas
    .getContext('2d')
    .getImageData(0, 0, canvas.width, canvas.height);
  return data.some((value, i) => i % 4 === 3 && value !== 0);
}
