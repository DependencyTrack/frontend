import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { request } from '@playwright/test';
import {
  ADMIN_PASSWORD,
  API_URL,
  APP_URL,
  Api,
  HEALTH_URL,
  HYDRA_ADMIN_URL,
  OIDC_CLIENT_ID,
  uniqueName,
} from './api.mjs';

export default async function globalSetup() {
  await waitForHealth();

  // Fails when the stack is reused and the password was already changed.
  const anonymous = await request.newContext({ baseURL: API_URL });
  await anonymous.post('/api/v1/user/forceChangePassword', {
    form: {
      username: 'admin',
      password: 'admin',
      newPassword: ADMIN_PASSWORD,
      confirmPassword: ADMIN_PASSWORD,
    },
  });
  await anonymous.dispose();

  const api = await Api.login();
  const purl = 'pkg:maven/com.fasterxml.jackson.core/jackson-databind@2.13.2.2';
  const vulnId = uniqueName('E2E');
  await api.send('PUT', '/v1/vulnerability', {
    vulnId,
    cvssV3Vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
    cwes: [502],
    affectedComponents: [
      { identityType: 'PURL', identity: purl, versionType: 'EXACT' },
    ],
  });

  // KEV assertions have no write API, only the mirror of the CISA feed writes them.
  execFileSync(
    'docker',
    [
      'compose',
      '-f',
      new URL('compose.yaml', import.meta.url).pathname,
      'exec',
      '-T',
      'postgres',
      'psql',
      '-U',
      'dtrack',
      '-c',
      `INSERT INTO "KEV_ASSERTION" ("ASSERTER", "VULN_SOURCE", "VULN_ID", "REQUIRED_ACTION") VALUES ('cisa', 'INTERNAL', '${vulnId}', 'Apply the vendor fix.')`,
    ],
    { stdio: 'inherit' },
  );

  const project = { name: uniqueName('e2e-project'), version: '1.0.0' };
  const bom = await readFile(new URL('fixtures/bom.json', import.meta.url));
  const upload = await api.send('PUT', '/v1/bom', {
    projectName: project.name,
    projectVersion: project.version,
    autoCreate: true,
    bom: bom.toString('base64'),
  });
  await poll('BOM processing', async () => {
    const { processing, status } = await api.get(
      `/v1/event/token/${upload.token}`,
    );
    return !processing && status === 'COMPLETED';
  });

  await api.get(`/v1/metrics/project/${upload.projectUuid}/refresh`);
  await api.get('/v1/metrics/portfolio/refresh');

  const components = await api.get(
    `/v1/component/project/${upload.projectUuid}`,
  );
  const findings = await api.get(`/v1/finding/project/${upload.projectUuid}`);
  const services = await api.get(`/v1/service/project/${upload.projectUuid}`);
  const policy = await api.send('POST', '/v2/vuln-policies', {
    name: uniqueName('e2e-policy'),
    condition: `vuln.id == "${vulnId}"`,
    analysis: { state: 'IN_TRIAGE' },
    operation_mode: 'LOG',
  });
  const runs = await api.get('/v2/internal/workflow-runs');

  const seed = {
    project: { uuid: upload.projectUuid, ...project },
    componentUuid: components.find((c) => c.purl === purl).uuid,
    serviceUuid: services[0].uuid,
    vulnId,
    vulnUuid: findings.find((f) => f.vulnerability.vulnId === vulnId)
      .vulnerability.uuid,
    vulnPolicyUuid: policy.uuid,
    workflowRunId: runs.items[0].id,
  };
  process.env.E2E_SEED = JSON.stringify(seed);
  await api.dispose();
  await registerOidcClient();
}

async function registerOidcClient() {
  const res = await fetch(`${HYDRA_ADMIN_URL}/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: OIDC_CLIENT_ID,
      token_endpoint_auth_method: 'none',
      grant_types: ['authorization_code'],
      response_types: ['code'],
      scope: 'openid profile email',
      redirect_uris: [`${APP_URL}/static/oidc-callback.html`],
    }),
  });
  // 409: registered by an earlier run against the same stack.
  if (!res.ok && res.status !== 409) {
    throw new Error(
      `Registering the OIDC client failed with ${res.status}: ${await res.text()}`,
    );
  }
}

async function waitForHealth() {
  await poll(
    `API server health at ${HEALTH_URL}`,
    async () => {
      try {
        return (await fetch(HEALTH_URL)).ok;
      } catch {
        return false;
      }
    },
    180_000,
  );
}

async function poll(what, condition, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (!(await condition())) {
    if (Date.now() > deadline) {
      throw new Error(`Timed out waiting for ${what}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}
