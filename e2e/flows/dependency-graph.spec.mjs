import { seed, uniqueName } from '../api.mjs';
import {
  test,
  expect,
  highlightedOption,
  login,
  pickOption,
  setTheme,
} from '../test.mjs';

const GRAPH_ROUTE = '**/api/v2/projects/*/dependency-graph';
const LAYOUT_WORKER_ROUTE = '**/dependencyGraphLayout.worker*';

test('dependency graph shows an uploaded BOM, including a component reached over many paths', async ({
  page,
  api,
}) => {
  const { projectUuid, uuids } = await uploadBom(api, ladder(30));
  await login(page);
  await page.goto(`projects/${projectUuid}/dependencyGraph`);
  const graph = page.getByRole('tabpanel');
  const link = (name) => graph.getByRole('link', { name });
  const direct = link('layer-1-a 1, direct dependency');
  await expect(direct).toHaveAttribute(
    'href',
    `/components/${uuids['layer-1-a']}`,
  );
  await expect(graph.getByText('Direct dependency')).toBeVisible();

  const toggle = graph.getByRole('button', { name: 'layer-1-a 1' });
  await toggle.click();
  await expect(link(/layer-2-a 1$/)).toBeVisible();
  await toggle.click();
  await expect(link('layer-2-a')).toBeHidden();

  const leaf = 'layer-30-a';
  await page.goto(`projects/${projectUuid}/dependencyGraph/${uuids[leaf]}`);
  await expect(link(leaf)).toBeInViewport({ ratio: 1 });
  // Only one component of the last layer leads to the searched component, which is itself.
  await expect(graph.getByRole('link')).toHaveCount(2 * 29 + 1);
});

test('dependency graph focuses on the paths to a component', async ({
  page,
}) => {
  const { project } = seed();
  const uuids = await stubGraph(page, {
    app: ['long', 'short', 'bystander'],
    long: ['middle'],
    middle: ['target'],
    short: ['target'],
    target: ['below'],
    below: [],
    bystander: [],
  });
  await login(page);
  let loads = 0;
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.endsWith('/dependency-graph')) loads++;
  });
  const base = `projects/${project.uuid}/dependencyGraph`;
  await page.goto(base);
  const graph = page.getByRole('tabpanel');
  const link = (name) => graph.getByRole('link', { name });
  const showPaths = (name) =>
    graph
      .getByRole('group', { name })
      .getByRole('button', { name: 'Show paths to this component' });
  const pathsTo = (name) => graph.getByText(`Paths to ${name}`);
  const clearPaths = graph.getByRole('button', { name: 'Clear paths' });
  const clearSearch = graph.getByRole('button', { name: 'Clear search' });
  const shortest = graph.getByLabel('Shortest path');

  await graph.getByRole('button', { name: 'short 1' }).click();
  await expect(link('target')).toBeVisible();
  await expect(link('middle')).toHaveCount(0);

  await showPaths('target').click();
  await expect(link('middle')).toBeVisible();
  await expect(link('below')).toHaveCount(0);
  await expect(link('bystander')).toHaveCount(0);
  await expect(graph.getByText('Showing 4 of 6 components')).toBeVisible();
  for (const hovered of ['target', 'long']) {
    await link(hovered).hover();
    for (const name of ['long', 'middle', 'short', 'target']) {
      await expect(link(name)).toHaveCSS('opacity', '1');
    }
  }

  await page.goBack();
  await expect(link('bystander')).toBeVisible();
  await expect(link('target')).toBeVisible();
  await page.goForward();
  await expect(link('bystander')).toHaveCount(0);
  expect(loads).toBe(1);

  await page.reload();
  await expect(link('middle')).toBeVisible();
  await expect(link('bystander')).toHaveCount(0);

  await shortest.click();
  await expect(link('short')).toBeVisible();
  await expect(link('target')).toBeInViewport();
  for (const hidden of ['long', 'middle', 'below', 'bystander']) {
    await expect(link(hidden)).toHaveCount(0);
  }
  await expect(graph.getByText('Showing 2 of 6 components')).toBeVisible();
  await shortest.click();
  await expect(link('long')).toBeVisible();
  await expect(graph.getByText('Showing 4 of 6 components')).toBeVisible();
  await shortest.click();
  await expect(link('long')).toHaveCount(0);

  await pickOption(page, 'Component Search', 'below 1', 'below');
  await expect(pathsTo('below')).toBeVisible();
  await expect(link('below')).toBeInViewport();
  await expect(graph.getByRole('group', { name: 'app 1' })).toBeInViewport();
  await expect(shortest).not.toBeChecked();
  await expect(link('long')).toBeVisible();
  await expect(clearSearch).toHaveCount(0);
  await expect(graph.getByRole('button', { name: 'app 1' })).toHaveCount(0);

  await clearPaths.click();
  await expect(pathsTo('')).toHaveCount(0);
  await expect(link('bystander')).toBeVisible();
  await expect(link('below')).toHaveCount(0);
  await expect(shortest).toHaveCount(0);
  await expect(page).toHaveURL(/dependencyGraph$/);

  await showPaths('long').click();
  await expect(pathsTo('long')).toBeVisible();
  await showPaths('long').click();
  await expect(pathsTo('')).toHaveCount(0);

  await page.goto(`${base}/${uuids.target}|${uuids.bystander}`);
  await expect(link('target')).toBeVisible();
  await expect(link('bystander')).toBeVisible();
  await expect(pathsTo('')).toHaveCount(0);
  await expect(clearSearch).toBeVisible();
  await expect(searchBox(page)).not.toContainText('target');
  await graph.getByRole('button', { name: 'target 1' }).click();
  await expect(link('below')).toBeVisible();
  await expect(graph.getByText('Dependency path')).toBeVisible();
});

test('dependency graph search tells apart components that differ only late in a long group', async ({
  page,
}) => {
  const { project } = seed();
  const group = (suffix) => `org.${'foooooo.baaaaaar.'.repeat(8)}${suffix}`;
  const name = 'api-with-a-long-name-'.repeat(4) + 'end';
  const suffixes = Array.from({ length: 30 }, (_, i) => `s${i}`);
  await stubGraph(
    page,
    {
      app: suffixes,
      ...Object.fromEntries(suffixes.map((suffix) => [suffix, []])),
    },
    Object.fromEntries(
      suffixes.map((suffix) => [suffix, { name, group: group(suffix) }]),
    ),
  );
  await login(page);
  await page.goto(`projects/${project.uuid}/dependencyGraph`);
  const graph = page.getByRole('tabpanel');
  const search = page.getByRole('textbox', { name: 'Component Search' });
  await searchBox(page).click();
  await search.fill('api');

  await expect(
    graph.getByRole('option').getByText(group('s0'), { exact: true }),
  ).toBeInViewport({ ratio: 1 });

  const highlighted = () => highlightedOption(page, 'Component Search');
  for (const key of [...Array(20).fill('ArrowDown'), 'ArrowUp', 'ArrowUp']) {
    await search.press(key);
    await expect(await highlighted()).toBeInViewport({ ratio: 1 });
  }

  await expect(await highlighted()).toContainText(group('s18'));
  await search.press('Enter');
  const label = `${group('s18')}/${name} 1`;
  await expect(graph.getByText(`Paths to ${label}`)).toBeInViewport();
  await expect(searchBox(page).getByTitle(label)).toBeVisible();
});

test('dependency graph can be moved around without getting lost', async ({
  page,
}) => {
  const { project } = seed();
  const uuids = await stubGraph(page, ladder(30));
  await login(page);
  await page.goto(
    `projects/${project.uuid}/dependencyGraph/${uuids['layer-30-a']}`,
  );
  const graph = page.getByRole('tabpanel');
  const target = graph.getByRole('link', { name: 'layer-30-a' });
  const distant = graph.getByRole('link', { name: 'layer-1-a' });
  const button = (name) => graph.getByRole('button', { name });
  const width = async () => (await target.boundingBox()).width;
  await expect(target).toBeVisible();

  // Only keyboard use counts as focus-visible, so this has to come before any mouse use.
  await expect(distant).not.toBeInViewport();
  await distant.focus();
  await expect(distant).toBeInViewport({ ratio: 1 });
  await expect(target).not.toBeInViewport();

  await button('Paths to layer-30-a').click();
  await expect(target).toBeInViewport();
  await expect.poll(width).toBeCloseTo(272, 0);
  // A trial click waits for the page to stop moving the element.
  await target.click({ trial: true });

  const before = await target.boundingBox();
  const x = before.x + before.width / 2;
  const y = before.y + before.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 100, y - 40, { steps: 5 });
  await page.mouse.up();
  const after = await target.boundingBox();
  expect(after.x).toBeCloseTo(before.x - 100, 0);
  expect(after.y).toBeCloseTo(before.y - 40, 0);
  await expect(page).toHaveURL(/dependencyGraph/);

  const box = await target.boundingBox();
  await page.mouse.move(box.x + 50, box.y + 20);
  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(2000, 0);
  }
  await expect(target).not.toBeInViewport();

  await button('Zoom in').click();
  await expect.poll(width).toBeGreaterThan(272);
  await button('Zoom out').click();
  await button('Zoom out').click();
  await expect.poll(width).toBeLessThan(272);

  await button('Fit to view').click();
  await expect(target).toBeInViewport();
  await expect.poll(width).toBeCloseTo(272, 0);
  for (let i = 0; i < 25; i++) {
    await button('Zoom out').click();
  }
  await expect(target).toBeVisible();
  expect(await width()).toBeGreaterThanOrEqual(0.35 * 272 - 1);
  for (let i = 0; i < 25; i++) {
    await button('Zoom in').click();
  }
  await expect(target).toBeInViewport();
});

test('dependency graph follows the theme', async ({ page }) => {
  const { project } = seed();
  await page.emulateMedia({ colorScheme: 'dark' });
  await login(page);
  await page.goto(`projects/${project.uuid}/dependencyGraph`);
  const node = page
    .getByRole('tabpanel')
    .getByRole('link', { name: 'jackson-databind' });
  await expect(node).toHaveCSS('background-color', 'rgb(23, 21, 30)');
  await setTheme(page, 'Light');
  await expect(node).toHaveCSS('background-color', 'rgb(255, 255, 255)');
});

test('dependency graph says what it is waiting for and what went wrong', async ({
  page,
  problems,
}) => {
  problems.allow(/\/dependency-graph 500/);
  const { project } = seed();
  const url = `projects/${project.uuid}/dependencyGraph`;
  await login(page);
  const graph = page.getByRole('tabpanel');
  const busy = graph.getByRole('status');

  const graphLoad = Promise.withResolvers();
  await page.route(GRAPH_ROUTE, async (route) => {
    await graphLoad.promise;
    await route.fulfill({ status: 500 });
  });
  await page.goto(url);
  await expect(busy.filter({ hasText: 'Loading' })).toBeVisible();
  graphLoad.resolve();
  await expect(
    page.getByText('The dependency graph could not be loaded'),
  ).toBeVisible();
  await expect(busy).toHaveCount(0);

  await page.unroute(GRAPH_ROUTE);
  await stubGraph(page, { app: ['connected'], connected: [], orphan: [] });
  const layout = Promise.withResolvers();
  await page.route(LAYOUT_WORKER_ROUTE, async (route) => {
    await layout.promise;
    await route.continue();
  });
  await page.goto(url);
  await expect(busy.filter({ hasText: 'Laying out graph' })).toBeVisible();
  layout.resolve();
  await expect(graph.getByRole('link', { name: 'connected' })).toBeVisible();
  await expect(busy).toHaveCount(0);

  await pickOption(page, 'Component Search', 'orphan 1', 'orphan');
  await expect(
    page.getByText('Dependency could not be found in dependency graph'),
  ).toBeVisible();
  await expect(graph.getByRole('link', { name: 'connected' })).toBeVisible();
  await expect(graph.getByRole('link', { name: 'orphan' })).toHaveCount(0);

  await page.unroute(GRAPH_ROUTE);
  await stubGraph(page, { app: [], lonely: [] });
  await page.goto(url);
  await expect(
    graph.getByText('This project has no dependency information'),
  ).toBeVisible();
  await expect(graph.getByText('Direct dependency')).toHaveCount(0);

  await page.unroute(LAYOUT_WORKER_ROUTE);
  await page.route(LAYOUT_WORKER_ROUTE, (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: "throw new Error('Maximum call stack size exceeded');",
    }),
  );
  await page.goto(url);
  await expect(page.getByText('The graph could not be laid out')).toBeVisible();
  await expect(busy).toHaveCount(0);
});

test('dependency graph expands to fill the window', async ({ page }) => {
  const { project } = seed();
  await stubGraph(page, {
    app: ['parent', 'bystander'],
    parent: ['target'],
    target: [],
    bystander: [],
  });
  await page.setViewportSize({ width: 1024, height: 700 });
  await login(page);
  await page.goto(`projects/${project.uuid}/dependencyGraph`);
  const graph = page.getByRole('tabpanel');
  const frame = graph.getByRole('region', { name: 'Dependency Graph' });
  const expand = graph.getByRole('button', { name: 'Expand graph' });
  const collapse = graph.getByRole('button', { name: 'Collapse graph' });
  const sidebar = page.getByRole('link', { name: 'Dashboard' });
  const parent = graph.getByRole('link', { name: 'parent' });
  const bystander = graph.getByRole('link', { name: 'bystander' });
  await expect(parent).toBeVisible();
  expect((await parent.boundingBox()).y).toBeLessThan(
    (await bystander.boundingBox()).y,
  );
  expect((await frame.boundingBox()).width).toBeLessThan(1024);

  await expand.click();
  await expect
    .poll(async () => frame.boundingBox())
    .toEqual({ x: 0, y: 0, width: 1024, height: 700 });
  await sidebar.focus();
  await expect(sidebar).not.toBeFocused();

  for (const name of ['Zoom in', 'Zoom out', 'Fit to view', 'Collapse graph']) {
    await expect(graph.getByRole('button', { name })).toBeInViewport();
  }
  await graph.getByRole('button', { name: 'Zoom in' }).click();
  await graph.getByRole('button', { name: 'Fit to view' }).click();
  await expect
    .poll(async () => (await parent.boundingBox()).width)
    .toBeCloseTo(272, 0);
  await expect(parent).toBeInViewport();
  await expect(bystander).toBeInViewport();

  await pickOption(page, 'Component Search', 'target 1', 'target');
  const chip = graph.getByText('Paths to target');
  await expect(chip).toBeVisible();
  await expect(collapse).toBeVisible();

  const search = page.getByRole('textbox', { name: 'Component Search' });
  await page.getByRole('combobox').filter({ has: search }).click();
  await search.press('Escape');
  await expect(collapse).toBeVisible();

  await page.locator('body').press('Escape');
  await expect(expand).toBeVisible();
  await expect(chip).toBeVisible();
  expect((await frame.boundingBox()).width).toBeLessThan(1024);
  await sidebar.focus();
  await expect(sidebar).toBeFocused();

  await page.goto(`projects/${project.uuid}/components`);
  await page.getByRole('tab', { name: 'Dependency Graph' }).click();
  await expand.click();
  await expect(collapse).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('tab', { name: 'Components' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await sidebar.focus();
  await expect(sidebar).toBeFocused();
});

test('large dependency graph only draws what is in view and limits search results', async ({
  page,
}) => {
  const { project } = seed();
  const names = Array.from({ length: 3000 }, (_, i) => `big-${i}`);
  await stubGraph(page, {
    app: names,
    ...Object.fromEntries(names.map((name) => [name, []])),
  });
  await login(page);
  await page.goto(`projects/${project.uuid}/dependencyGraph`);
  const graph = page.getByRole('tabpanel');
  const links = graph.getByRole('link');
  const expectOnlySomeDrawn = async () => {
    await expect.poll(() => links.count()).toBeGreaterThan(0);
    expect(await links.count()).toBeLessThan(1000);
  };
  await expectOnlySomeDrawn();

  const drawn = graph.getByRole('link', {
    name: await links.first().getAttribute('aria-label'),
    exact: true,
  });
  // Away from the cards, as a hovered node stays drawn.
  const box = await graph
    .getByRole('region', { name: 'Dependency Graph' })
    .boundingBox();
  await page.mouse.move(box.x + 5, box.y + box.height / 2);
  for (let i = 0; i < 12; i++) {
    await page.mouse.wheel(0, -1000);
  }
  await expect(drawn).toHaveCount(0);
  await expectOnlySomeDrawn();

  const projectNode = graph.getByRole('group', { name: 'app 1' });
  await expect(projectNode).toHaveCount(0);
  await graph.getByRole('button', { name: 'Fit to view' }).click();
  await expect(projectNode).toBeInViewport();
  await expectOnlySomeDrawn();

  const search = page.getByRole('textbox', { name: 'Component Search' });
  await page.getByRole('combobox').filter({ has: search }).click();
  await search.fill('big');
  await expect(page.getByText('Showing 50 of 3000')).toBeVisible();
});

function searchBox(page) {
  return page
    .getByRole('combobox')
    .filter({ has: page.getByRole('textbox', { name: 'Component Search' }) });
}

async function stubGraph(page, { app, ...components }, details = {}) {
  const uuids = Object.fromEntries(
    Object.keys(components).map((name) => [name, crypto.randomUUID()]),
  );
  const toUuids = (names) => names.map((name) => uuids[name]);
  await page.route(GRAPH_ROUTE, (route) =>
    route.fulfill({
      json: {
        nodes: [
          {
            uuid: new URL(route.request().url()).pathname.split('/').at(-2),
            type: 'PROJECT',
            name: 'app',
            version: '1',
            direct_dependencies: toUuids(app),
          },
          ...Object.entries(components).map(([name, dependsOn]) => ({
            uuid: uuids[name],
            type: 'COMPONENT',
            name,
            version: '1',
            direct_dependencies: toUuids(dependsOn),
            ...details[name],
          })),
        ],
      },
    }),
  );
  return uuids;
}

// Two components per layer, each depending on both of the next, make 2^layers paths from the project to the last layer.
function ladder(layers) {
  const refs = (layer) => [`layer-${layer}-a`, `layer-${layer}-b`];
  const graph = { app: refs(1) };
  for (let layer = 1; layer <= layers; layer++) {
    for (const ref of refs(layer)) {
      graph[ref] = layer < layers ? refs(layer + 1) : [];
    }
  }
  return graph;
}

async function uploadBom(api, graph) {
  const names = Object.keys(graph).filter((name) => name !== 'app');
  const bom = {
    bomFormat: 'CycloneDX',
    specVersion: '1.6',
    version: 1,
    metadata: {
      component: { 'bom-ref': 'app', type: 'application', name: 'app' },
    },
    components: names.map((name) => ({
      'bom-ref': name,
      type: 'library',
      name,
      version: '1',
    })),
    dependencies: Object.entries(graph).map(([ref, dependsOn]) => ({
      ref,
      dependsOn,
    })),
  };
  const { projectUuid, token } = await api.send('PUT', '/v1/bom', {
    projectName: uniqueName('e2e-graph'),
    projectVersion: '1.0.0',
    autoCreate: true,
    bom: Buffer.from(JSON.stringify(bom)).toString('base64'),
  });
  await expect
    .poll(async () => (await api.get(`/v1/event/token/${token}`)).status)
    .toBe('COMPLETED');
  const stored = await api.get(
    `/v1/component/project/${projectUuid}?pageSize=100`,
  );
  return {
    projectUuid,
    uuids: Object.fromEntries(stored.map((c) => [c.name, c.uuid])),
  };
}
