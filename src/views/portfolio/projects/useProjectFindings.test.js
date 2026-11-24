import { effectScope, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import api from '@/shared/api.json';
import EventBus from '@/shared/eventbus';
import { VIEW_VULNERABILITY } from '@/shared/permissions';
import {
  PROJECT_FINDINGS_UPDATED_EVENT,
  useProjectFindings,
} from './useProjectFindings';

async function flush() {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function finding(componentUuid, severity, vulnUuid = 'v1') {
  return {
    component: { uuid: componentUuid },
    vulnerability: { uuid: vulnUuid, severity },
    analysis: { isSuppressed: false },
  };
}

describe('useProjectFindings', () => {
  const scopes = [];

  function mount(options = {}) {
    const project = ref(
      options.project ?? {
        uuid: 'proj-1',
        lastBomImport: 1000,
        lastVulnerabilityAnalysis: 2000,
      },
    );
    const uuid = ref(options.uuid ?? 'proj-1');
    const wanted = ref(options.wanted ?? false);
    const routePath = ref(
      options.routePath ?? '/projects/proj-1/dependencyGraph',
    );
    const get =
      options.get ??
      vi.fn().mockResolvedValue({
        data: [],
        headers: { 'x-total-count': '0' },
      });
    const hasPermission =
      options.hasPermission ?? vi.fn((perm) => perm === VIEW_VULNERABILITY);

    const scope = effectScope();
    scopes.push(scope);
    const state = scope.run(() =>
      useProjectFindings({
        project: () => project.value,
        uuid: () => uuid.value,
        wanted,
        routePath: () => routePath.value,
        get,
        hasPermission,
        eventBus: EventBus,
        baseUrl: () => 'https://api.example.test',
        findingPath: () => api.URL_FINDING,
        pageSize: options.pageSize,
        maxPages: options.maxPages,
      }),
    );

    return {
      ...state,
      project,
      uuid,
      wanted,
      routePath,
      get,
      hasPermission,
      stop: () => scope.stop(),
    };
  }

  afterEach(() => {
    while (scopes.length > 0) {
      scopes.pop().stop();
    }
    vi.restoreAllMocks();
  });

  it('defers loading until wanted becomes true and uses api.URL_FINDING', async () => {
    const get = vi.fn().mockResolvedValue({
      data: [finding('comp-1', 'HIGH')],
      headers: { 'x-total-count': '1' },
    });
    const ctx = mount({ get });

    await flush();
    expect(get).not.toHaveBeenCalled();
    expect(ctx.vulnerabilitiesByComponent.value.size).toBe(0);

    ctx.wanted.value = true;
    await flush();

    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith(
      `https://api.example.test/${api.URL_FINDING}/project/proj-1`,
      expect.objectContaining({
        params: { suppressed: false, pageNumber: 1, pageSize: 1000 },
      }),
    );
    expect(ctx.vulnerabilitiesByComponent.value.get('comp-1')).toMatchObject({
      total: 1,
      highestSeverity: 'HIGH',
    });
  });

  it('does not request findings without VIEW_VULNERABILITY permission', async () => {
    const get = vi.fn();
    const hasPermission = vi.fn(() => false);
    const ctx = mount({ get, hasPermission });

    ctx.wanted.value = true;
    await flush();

    expect(hasPermission).toHaveBeenCalledWith(VIEW_VULNERABILITY);
    expect(get).not.toHaveBeenCalled();
    expect(ctx.vulnerabilitiesByComponent.value.size).toBe(0);
    expect(ctx.findingsFailed.value).toBe(false);
  });

  it('aborts in-flight requests on reload and unmount, and rejects stale responses', async () => {
    const first = deferred();
    const second = deferred();
    const signals = [];
    const get = vi.fn((_url, { signal }) => {
      signals.push(signal);
      return signals.length === 1 ? first.promise : second.promise;
    });

    const ctx = mount({ get });
    ctx.wanted.value = true;
    await flush();
    expect(signals).toHaveLength(1);
    expect(signals[0].aborted).toBe(false);

    // Trigger a newer load before the first resolves.
    ctx.project.value = {
      ...ctx.project.value,
      lastVulnerabilityAnalysis: 3000,
    };
    await flush();
    expect(signals[0].aborted).toBe(true);
    expect(signals).toHaveLength(2);
    expect(signals[1].aborted).toBe(false);

    // Newer response arrives first.
    second.resolve({
      data: [finding('comp-1', 'LOW')],
      headers: { 'x-total-count': '1' },
    });
    await flush();
    expect(
      ctx.vulnerabilitiesByComponent.value.get('comp-1')?.highestSeverity,
    ).toBe('LOW');

    // Older slow response resolves afterwards and must not overwrite newer data.
    first.resolve({
      data: [finding('comp-1', 'CRITICAL')],
      headers: { 'x-total-count': '1' },
    });
    await flush();
    expect(
      ctx.vulnerabilitiesByComponent.value.get('comp-1')?.highestSeverity,
    ).toBe('LOW');

    // Start a third request and dispose the scope (component unmount).
    const third = deferred();
    get.mockImplementationOnce((_url, { signal }) => {
      signals.push(signal);
      return third.promise;
    });
    ctx.project.value = { ...ctx.project.value, lastBomImport: 4000 };
    await flush();
    expect(signals[2].aborted).toBe(false);

    ctx.stop();
    expect(signals[2].aborted).toBe(true);
  });

  it('clears vulnerability state when project uuid mismatches and reloads on uuid, lastBomImport, and lastVulnerabilityAnalysis changes', async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce({
        data: [finding('comp-1', 'MEDIUM')],
        headers: { 'x-total-count': '1' },
      })
      .mockResolvedValueOnce({
        data: [finding('comp-2', 'HIGH')],
        headers: { 'x-total-count': '1' },
      })
      .mockResolvedValueOnce({
        data: [finding('comp-2', 'CRITICAL')],
        headers: { 'x-total-count': '1' },
      })
      .mockResolvedValueOnce({
        data: [finding('comp-3', 'LOW')],
        headers: { 'x-total-count': '1' },
      });

    const ctx = mount({ get });
    ctx.wanted.value = true;
    await flush();
    expect(ctx.vulnerabilitiesByComponent.value.has('comp-1')).toBe(true);

    // BOM import change reloads findings.
    ctx.project.value = { ...ctx.project.value, lastBomImport: 1500 };
    await flush();
    expect(
      ctx.vulnerabilitiesByComponent.value.get('comp-2')?.highestSeverity,
    ).toBe('HIGH');

    // Vulnerability analysis timestamp change reloads findings.
    ctx.project.value = {
      ...ctx.project.value,
      lastVulnerabilityAnalysis: 2500,
    };
    await flush();
    expect(
      ctx.vulnerabilitiesByComponent.value.get('comp-2')?.highestSeverity,
    ).toBe('CRITICAL');

    // Switching to another project uuid clears stale highlights while project object hasn't caught up yet.
    ctx.uuid.value = 'proj-2';
    await flush();
    expect(ctx.vulnerabilitiesByComponent.value.size).toBe(0);
    expect(get).toHaveBeenCalledTimes(3);

    // Once new project object arrives, loads findings for proj-2.
    ctx.project.value = {
      uuid: 'proj-2',
      lastBomImport: 5000,
      lastVulnerabilityAnalysis: 6000,
    };
    await flush();
    expect(get).toHaveBeenCalledTimes(4);
    expect(get).toHaveBeenLastCalledWith(
      `https://api.example.test/${api.URL_FINDING}/project/proj-2`,
      expect.any(Object),
    );
    expect(
      ctx.vulnerabilitiesByComponent.value.get('comp-3')?.highestSeverity,
    ).toBe('LOW');
  });

  it('removes highlight after suppressing a finding in Audit Vulnerabilities and returning to the dependency graph', async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce({
        data: [finding('comp-1', 'CRITICAL')],
        headers: { 'x-total-count': '1' },
      })
      .mockResolvedValueOnce({
        data: [],
        headers: { 'x-total-count': '0' },
      });

    const ctx = mount({ get });
    // 1. Open dependency graph.
    ctx.wanted.value = true;
    await flush();
    expect(
      ctx.vulnerabilitiesByComponent.value.get('comp-1')?.highestSeverity,
    ).toBe('CRITICAL');

    // 2. Switch to Audit Vulnerabilities and suppress the finding.
    ctx.routePath.value = '/projects/proj-1/findings';
    await flush();
    EventBus.emit(PROJECT_FINDINGS_UPDATED_EVENT, 'proj-1');
    await flush();
    // Should not fetch while the graph tab is inactive.
    expect(get).toHaveBeenCalledTimes(1);

    // 3. Return to the dependency graph.
    ctx.routePath.value = '/projects/proj-1/dependencyGraph';
    await flush();

    // 4. Verify the suppressed finding is no longer highlighted.
    expect(get).toHaveBeenCalledTimes(2);
    expect(ctx.vulnerabilitiesByComponent.value.has('comp-1')).toBe(false);
  });

  it('reflects severity override changes when returning via "Show in dependency graph"', async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce({
        data: [finding('comp-1', 'MEDIUM')],
        headers: { 'x-total-count': '1' },
      })
      .mockResolvedValueOnce({
        data: [finding('comp-1', 'CRITICAL')],
        headers: { 'x-total-count': '1' },
      });

    const ctx = mount({ get });
    ctx.wanted.value = true;
    await flush();
    expect(
      ctx.vulnerabilitiesByComponent.value.get('comp-1')?.highestSeverity,
    ).toBe('MEDIUM');

    ctx.routePath.value = '/projects/proj-1/findings';
    await flush();
    EventBus.emit(PROJECT_FINDINGS_UPDATED_EVENT, 'proj-1');
    await flush();

    // Navigate via "Show in dependency graph" with componentUuid in path.
    ctx.routePath.value = '/projects/proj-1/dependencyGraph/comp-1';
    await flush();

    expect(get).toHaveBeenCalledTimes(2);
    expect(
      ctx.vulnerabilitiesByComponent.value.get('comp-1')?.highestSeverity,
    ).toBe('CRITICAL');
  });

  it('refreshes when returning from /findings without an event, avoids unnecessary requests from other tabs, and avoids duplicate requests on first deep link', async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce({
        data: [finding('comp-1', 'HIGH')],
        headers: { 'x-total-count': '1' },
      })
      .mockResolvedValueOnce({
        data: [finding('comp-1', 'LOW')],
        headers: { 'x-total-count': '1' },
      });

    // First visit directly from /findings via "Show in dependency graph" (wanted flips false -> true in same tick).
    const ctx = mount({ get, routePath: '/projects/proj-1/findings' });
    ctx.routePath.value = '/projects/proj-1/dependencyGraph/comp-1';
    ctx.wanted.value = true;
    await flush();
    expect(get).toHaveBeenCalledTimes(1);

    // Switching to Components and back without auditing makes zero unnecessary requests.
    ctx.routePath.value = '/projects/proj-1/components';
    await flush();
    ctx.routePath.value = '/projects/proj-1/dependencyGraph';
    await flush();
    expect(get).toHaveBeenCalledTimes(1);

    // Switching to Findings and returning refreshes even if no EventBus signal fired.
    ctx.routePath.value = '/projects/proj-1/findings';
    await flush();
    ctx.routePath.value = '/projects/proj-1/dependencyGraph';
    await flush();
    expect(get).toHaveBeenCalledTimes(2);
    expect(
      ctx.vulnerabilitiesByComponent.value.get('comp-1')?.highestSeverity,
    ).toBe('LOW');
  });

  it('tracks transient API failures and recovers on retry', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const get = vi
      .fn()
      .mockRejectedValueOnce(new Error('503 Service Unavailable'))
      .mockResolvedValueOnce({
        data: [finding('comp-1', 'HIGH')],
        headers: { 'x-total-count': '1' },
      });

    const ctx = mount({ get });
    ctx.wanted.value = true;
    await flush();

    expect(ctx.findingsFailed.value).toBe(true);
    expect(ctx.vulnerabilitiesByComponent.value.size).toBe(0);
    expect(warn).toHaveBeenCalledTimes(1);

    // Retry via user interaction (reopening search).
    ctx.retryFindings();
    await flush();

    expect(get).toHaveBeenCalledTimes(2);
    expect(ctx.findingsFailed.value).toBe(false);
    expect(
      ctx.vulnerabilitiesByComponent.value.get('comp-1')?.highestSeverity,
    ).toBe('HIGH');
  });

  it('retries automatically on tab re-entry after a previous API failure', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const get = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce({
        data: [finding('comp-1', 'MEDIUM')],
        headers: { 'x-total-count': '1' },
      });

    const ctx = mount({ get });
    ctx.wanted.value = true;
    await flush();
    expect(ctx.findingsFailed.value).toBe(true);

    ctx.routePath.value = '/projects/proj-1/components';
    await flush();
    ctx.routePath.value = '/projects/proj-1/dependencyGraph';
    await flush();

    expect(get).toHaveBeenCalledTimes(2);
    expect(ctx.findingsFailed.value).toBe(false);
    expect(
      ctx.vulnerabilitiesByComponent.value.get('comp-1')?.highestSeverity,
    ).toBe('MEDIUM');
  });

  it('flags findingsTruncated when pagination reaches maxPages with remaining findings and clears it on complete reload', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const get = vi
      .fn()
      .mockResolvedValueOnce({
        data: [finding('comp-1', 'HIGH', 'v1'), finding('comp-2', 'LOW', 'v2')],
        headers: { 'x-total-count': '5' },
      })
      .mockResolvedValueOnce({
        data: [finding('comp-1', 'HIGH', 'v1')],
        headers: { 'x-total-count': '1' },
      });

    const ctx = mount({ get, pageSize: 2, maxPages: 1 });
    ctx.wanted.value = true;
    await flush();

    expect(ctx.findingsTruncated.value).toBe(true);
    expect(ctx.findingsFailed.value).toBe(false);
    expect(ctx.vulnerabilitiesByComponent.value.size).toBe(2);
    expect(warn).toHaveBeenCalledTimes(1);

    // Subsequent complete reload clears the truncation warning.
    ctx.project.value = {
      ...ctx.project.value,
      lastVulnerabilityAnalysis: 9999,
    };
    await flush();
    expect(ctx.findingsTruncated.value).toBe(false);
    expect(ctx.vulnerabilitiesByComponent.value.size).toBe(1);
  });
});
