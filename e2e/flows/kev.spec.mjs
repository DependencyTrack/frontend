import { seed } from '../api.mjs';
import { test, expect, login, search, auditSearch } from '../test.mjs';

const pages = {
  'occurrences audit': async (page, { vulnId }) => {
    await page.goto('vulnerabilityAudit/occurrences');
    await auditSearch(page, vulnId);
  },
  'grouped audit': async (page, { vulnId }) => {
    await page.goto('vulnerabilityAudit/grouped');
    await auditSearch(page, vulnId);
  },
  'project findings': async (page, { project, vulnId }) => {
    await page.goto(`projects/${project.uuid}/findings`);
    await search(page, vulnId);
  },
  'project exploit predictions': async (page, { project, vulnId }) => {
    await page.goto(`projects/${project.uuid}/epss`);
    await search(page, vulnId);
  },
  'vulnerability list': async (page, { vulnId }) => {
    await page.goto('vulnerabilities');
    await search(page, vulnId);
  },
};

for (const [name, open] of Object.entries(pages)) {
  test(`show the KEV assertions of a vulnerability in the ${name}`, async ({
    page,
  }) => {
    const { project, vulnId } = seed();
    await login(page);
    await open(page, { project, vulnId });
    await page
      .getByRole('row')
      .filter({ hasText: vulnId })
      .getByTitle('Click to show assertions')
      .click();
    const modal = page.getByRole('dialog', {
      name: `Known Exploited Vulnerability: ${vulnId}`,
    });
    await expect(modal).toContainText('Apply the vendor fix.');
  });
}
