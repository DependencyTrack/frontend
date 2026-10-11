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
  const vuln = await api.send('PUT', '/v1/vulnerability', {
    vulnId,
    cvssV3Vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
    cwes: [502],
    affectedComponents: [
      { identityType: 'PURL', identity: purl, versionType: 'EXACT' },
    ],
  });

  // The API can't write KEV assertions, EPSS scores, aliases or package metadata, and EPSS only reaches an internal vulnerability through a CVE alias.
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
      `INSERT INTO "KEV_ASSERTION" ("ASSERTER", "VULN_SOURCE", "VULN_ID", "REQUIRED_ACTION") VALUES ('cisa', 'INTERNAL', '${vulnId}', 'Apply the vendor fix.');
      INSERT INTO "EPSS" ("CVE", "SCORE", "PERCENTILE") VALUES ('CVE-${vulnId}', 0.5, 0.9);
      INSERT INTO "VULNERABILITY_ALIAS" ("GROUP_ID", "SOURCE", "VULN_ID")
        SELECT g.id, a.source, a.vuln_id
          FROM (SELECT gen_random_uuid() AS id) AS g,
               (VALUES ('INTERNAL', '${vulnId}'), ('NVD', 'CVE-${vulnId}')) AS a (source, vuln_id);
      INSERT INTO "PACKAGE_METADATA" ("PURL", "RESOLVED_AT") VALUES ('pkg:maven/com.fasterxml.jackson.core/jackson-core', now()) ON CONFLICT DO NOTHING;
      INSERT INTO "PACKAGE_ARTIFACT_METADATA" ("PURL", "PACKAGE_PURL", "HASH_SHA1", "RESOLVED_FROM")
        VALUES ('pkg:maven/com.fasterxml.jackson.core/jackson-core@2.13.2', 'pkg:maven/com.fasterxml.jackson.core/jackson-core', '0a6a0e0620d51833feffc67bccb51937b2345763', 'central')
        ON CONFLICT DO NOTHING`,
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
  await completed(api, 'BOM processing', upload.token);

  const violationPolicy = await api.send('PUT', '/v1/policy', {
    name: uniqueName('e2e-violation'),
    operator: 'ANY',
    violationState: 'WARN',
  });
  await api.send('PUT', `/v1/policy/${violationPolicy.uuid}/condition`, {
    subject: 'PACKAGE_URL',
    operator: 'MATCHES',
    value: purl,
  });
  await api.send(
    'POST',
    `/v1/policy/${violationPolicy.uuid}/project/${upload.projectUuid}`,
  );
  const analysis = await api.send(
    'POST',
    `/v1/finding/project/${upload.projectUuid}/analyze`,
  );
  await completed(api, 'policy evaluation', analysis.token);

  await api.get(`/v1/metrics/project/${upload.projectUuid}/refresh`);
  await api.get('/v1/metrics/portfolio/refresh');

  const components = await api.get(
    `/v1/component/project/${upload.projectUuid}`,
  );
  const services = await api.get(`/v1/service/project/${upload.projectUuid}`);
  const policy = await api.send('POST', '/v2/vuln-policies', {
    name: uniqueName('e2e-policy'),
    condition: `vuln.id == "${vulnId}"`,
    analysis: { state: 'IN_TRIAGE' },
    operation_mode: 'LOG',
  });
  const runs = await api.get(
    '/v2/internal/workflow-runs?workflow_name=import-bom',
  );

  const seed = {
    project: { uuid: upload.projectUuid, ...project },
    componentUuid: components.find((c) => c.purl === purl).uuid,
    serviceUuid: services[0].uuid,
    vulnId,
    vulnUuid: vuln.uuid,
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

function completed(api, what, token) {
  return poll(what, async () => {
    const { processing, status } = await api.get(`/v1/event/token/${token}`);
    return !processing && status === 'COMPLETED';
  });
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
