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
  const vulnRecommendation =
    'Upgrade to jackson-databind 2.13.4.2 or later. If upgrading is not possible, disable default typing.';
  const vuln = await api.send('PUT', '/v1/vulnerability', {
    vulnId,
    title: 'Deserialization of untrusted data in jackson-databind',
    description:
      'jackson-databind allows a crafted JSON payload to instantiate arbitrary classes when default typing is enabled. ' +
      'An attacker who controls the input can use gadget classes on the classpath to execute code remotely.\n\n' +
      'Applications are affected only if they enable default typing, or use @JsonTypeInfo with a class-based type id, ' +
      'and deserialize JSON from untrusted sources.',
    recommendation: vulnRecommendation,
    cvssV3Vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
    cvssV4Vector:
      'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N',
    cwes: [502],
    affectedComponents: [
      { identityType: 'PURL', identity: purl, versionType: 'EXACT' },
    ],
  });

  // The API can't write KEV assertions, EPSS scores, aliases, package metadata or package health, and EPSS only reaches an internal vulnerability through a CVE alias.
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
               (VALUES ('INTERNAL', '${vulnId}'), ('NVD', 'CVE-${vulnId}'), ('GITHUB', 'GHSA-${vulnId}')) AS a (source, vuln_id);
      INSERT INTO "PACKAGE_METADATA" ("PURL", "RESOLVED_AT") VALUES ('pkg:maven/com.fasterxml.jackson.core/jackson-core', now()) ON CONFLICT DO NOTHING;
      INSERT INTO "PACKAGE_ARTIFACT_METADATA" ("PURL", "PACKAGE_PURL", "HASH_SHA1", "RESOLVED_FROM")
        VALUES ('pkg:maven/com.fasterxml.jackson.core/jackson-core@2.13.2', 'pkg:maven/com.fasterxml.jackson.core/jackson-core', '0a6a0e0620d51833feffc67bccb51937b2345763', 'central')
        ON CONFLICT DO NOTHING;
      INSERT INTO "PACKAGE_HEALTH_METADATA" ("PURL", "STATUS", "LAST_FETCH", "STARS", "FORKS", "CONTRIBUTORS", "COMMIT_FREQUENCY_WEEKLY",
          "OPEN_ISSUES", "OPEN_PRS", "LAST_COMMIT", "BUS_FACTOR", "HAS_README", "HAS_CODE_OF_CONDUCT", "HAS_SECURITY_POLICY", "FILES",
          "IS_REPO_ARCHIVED", "SCORECARD_SCORE", "SCORECARD_REF_VERSION", "SCORECARD_TIMESTAMP", "AVG_ISSUE_AGE_DAYS",
          "DEPS_DEV_URL", "GITHUB_URL")
        VALUES ('pkg:maven/com.fasterxml.jackson.core/jackson-core', 'PROCESSED', now(), 11435, 1051, 144, 2.1,
          14, 1, '2026-10-03T12:00:00Z', 1, true, false, false, 127,
          false, 4.9, 'v5.2.1', '2026-08-24T12:00:00Z', 1727.9,
          'https://deps.dev/maven/com.fasterxml.jackson.core%3Ajackson-core', 'https://github.com/FasterXML/jackson-core')
        ON CONFLICT DO NOTHING;
      INSERT INTO "PACKAGE_HEALTH_SCORECARD_CHECK" ("PURL", "CHECK_NAME", "DESCRIPTION", "SCORE", "REASON", "DETAILS", "DOCUMENTATION_URL")
        SELECT 'pkg:maven/com.fasterxml.jackson.core/jackson-core', c.name, c.description, c.score, c.reason, c.details,
               'https://github.com/ossf/scorecard/blob/main/docs/checks.md#' || lower(c.name)
          FROM (VALUES
            ('Branch-Protection', 'Determines if the default and release branches are protected with GitHub''s branch protection settings.',
              0, 'branch protection not enabled on development/release branches', ARRAY['Warn: branch protection not enabled for branch ''master''']),
            ('Code-Review', 'Determines if the project requires human code review before pull requests are merged.',
              3, 'Found 9/30 approved changesets', ARRAY[]::text[]),
            ('Dangerous-Workflow', 'Determines if the project''s GitHub Action workflows avoid dangerous patterns.',
              10, 'no dangerous workflow patterns detected', ARRAY[]::text[]),
            ('Maintained', 'Determines if the project is "actively maintained".',
              10, '30 commit(s) and 2 issue activity found in the last 90 days', ARRAY[]::text[]),
            ('License', 'Determines if the project has defined a license.',
              10, 'license file detected', ARRAY['Info: project has a license file: LICENSE:0']),
            ('Signed-Releases', 'Determines if the project cryptographically signs release artifacts.',
              NULL, 'no releases found', ARRAY[]::text[])
          ) AS c (name, description, score, reason, details)
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
  const violationMessage = 'jackson-databind is not allowed';
  await api.send('PUT', `/v1/policy/${violationPolicy.uuid}/condition`, {
    subject: 'EXPRESSION',
    operator: 'MATCHES',
    violationType: 'OPERATIONAL',
    value: `component.purl == "${purl}" ? "${violationMessage}" : ""`,
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
  const violations = await api.get(
    `/v1/violation/project/${upload.projectUuid}`,
  );
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
    healthComponentUuid: components.find((c) => c.name === 'jackson-core').uuid,
    serviceUuid: services[0].uuid,
    vulnId,
    vulnUuid: vuln.uuid,
    vulnRecommendation,
    violationMessage,
    violationPolicy: violationPolicy.name,
    violationUuid: violations.find(
      (v) => v.policyCondition.policy.uuid === violationPolicy.uuid,
    ).uuid,
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
      grant_types: ['authorization_code', 'implicit'],
      response_types: ['code', 'id_token token'],
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
