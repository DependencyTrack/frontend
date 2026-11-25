import axios from 'axios';
import { onScopeDispose, onWatcherCleanup, ref, shallowRef, watch } from 'vue';
import api from '@/shared/api.json';
import EventBus from '@/shared/eventbus';
import {
  VIEW_VULNERABILITY,
  hasPermission as defaultHasPermission,
} from '@/shared/permissions';
import {
  fetchProjectFindings,
  summarizeFindingsByComponent,
} from './dependencyGraph';

export const PROJECT_FINDINGS_UPDATED_EVENT = 'project:findings:updated';

function isDependencyGraphPath(path) {
  return (
    typeof path === 'string' && path.toLowerCase().includes('/dependencygraph')
  );
}

function isFindingsPath(path) {
  return typeof path === 'string' && path.toLowerCase().includes('/findings');
}

export function useProjectFindings({
  project,
  uuid,
  wanted,
  routePath,
  get = axios.get,
  hasPermission = defaultHasPermission,
  eventBus = EventBus,
  baseUrl = () => api.BASE_URL,
  findingPath = () => api.URL_FINDING,
  pageSize,
  maxPages,
}) {
  const vulnerabilitiesByComponent = shallowRef(new Map());
  const findingsFailed = ref(false);
  const findingsTruncated = ref(false);
  const refreshRevision = ref(0);
  let auditDirty = false;

  function triggerRefresh() {
    if (!wanted.value) return;
    auditDirty = false;
    refreshRevision.value++;
  }

  function retryFindings() {
    if (findingsFailed.value && wanted.value) {
      triggerRefresh();
    }
  }

  async function loadFindings() {
    const currentProject = project();
    const currentUuid = uuid();
    if (!currentUuid || currentProject?.uuid !== currentUuid) {
      vulnerabilitiesByComponent.value = new Map();
      findingsFailed.value = false;
      findingsTruncated.value = false;
      return;
    }
    if (!wanted.value) return;
    if (!hasPermission(VIEW_VULNERABILITY)) {
      vulnerabilitiesByComponent.value = new Map();
      findingsFailed.value = false;
      findingsTruncated.value = false;
      return;
    }

    const controller = new AbortController();
    onWatcherCleanup(() => controller.abort());
    auditDirty = false;

    let result;
    try {
      result = await fetchProjectFindings(
        `${baseUrl()}/${findingPath()}/project/${currentUuid}`,
        {
          get,
          signal: controller.signal,
          ...(pageSize !== undefined && { pageSize }),
          ...(maxPages !== undefined && { maxPages }),
        },
      );
    } catch (error) {
      if (!controller.signal.aborted) {
        vulnerabilitiesByComponent.value = new Map();
        findingsFailed.value = true;
        findingsTruncated.value = false;
        console.warn(
          'Failed to load project findings for dependency graph',
          error?.message ?? error,
        );
      }
      return;
    }

    if (controller.signal.aborted) return;
    findingsFailed.value = false;
    findingsTruncated.value = result.truncated;
    if (result.truncated) {
      console.warn(
        'Project findings for dependency graph were truncated at the pagination limit',
        { loaded: result.findings.length, total: result.total },
      );
    }
    vulnerabilitiesByComponent.value = summarizeFindingsByComponent(
      result.findings,
    );
  }

  function onFindingsUpdated(updatedUuid) {
    if (updatedUuid !== uuid()) return;
    auditDirty = true;
    if (wanted.value && isDependencyGraphPath(routePath())) {
      triggerRefresh();
    }
  }

  eventBus.on(PROJECT_FINDINGS_UPDATED_EVENT, onFindingsUpdated);
  onScopeDispose(() => {
    eventBus.off(PROJECT_FINDINGS_UPDATED_EVENT, onFindingsUpdated);
  });

  watch(
    [
      () => uuid(),
      () => project()?.uuid,
      () => project()?.lastBomImport,
      () => project()?.lastVulnerabilityAnalysis,
      wanted,
      refreshRevision,
    ],
    loadFindings,
  );

  watch(routePath, (path, prevPath) => {
    if (
      isDependencyGraphPath(path) &&
      !isDependencyGraphPath(prevPath) &&
      wanted.value &&
      (auditDirty || findingsFailed.value || isFindingsPath(prevPath))
    ) {
      triggerRefresh();
    }
  });

  return {
    vulnerabilitiesByComponent,
    findingsFailed,
    findingsTruncated,
    retryFindings,
  };
}
