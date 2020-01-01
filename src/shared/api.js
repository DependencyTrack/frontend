/**
 * This module contains API details and all URL endpoints supported by the Dependency-Track REST API.
 * All API calls to the Dependency-Track server should make use of these constants in order to
 * avoid typographical errors.
 */
const BASE_URL = ""; // TODO
  // process.env.NODE_ENV === "production" ? process.env.VUE_APP_SERVER_URL : "";

// API Behavior
const CONTENT_TYPE_JSON = "application/json";
const ENCODE_MULTIPART_FORM_DATA = "multipart/form-data";
const CONTENT_TYPE_TEXT = "text/plain";
const TOTAL_COUNT_HEADER = "X-Total-Count";
const DATA_TYPE = "json";
const METHOD_GET = "GET";
const METHOD_POST = "POST";
const METHOD_PUT = "PUT";
const METHOD_DELETE = "DELETE";
const FORCE_PASSWORD_CHANGE = "FORCE_PASSWORD_CHANGE";

// API Endpoints
const URL_ABOUT = "api/version";
const URL_LOGIN = "api/v1/user/login";
const URL_FORCE_PW_CHANGE = "api/v1/user/forceChangePassword";
const URL_TEAM = "api/v1/team";
const URL_USER = "api/v1/user";
const URL_USER_LDAP = "api/v1/user/ldap";
const URL_USER_MANAGED = "api/v1/user/managed";
const URL_USER_SELF = "api/v1/user/self";
const URL_PERMISSION = "api/v1/permission";
const URL_PROJECT = "api/v1/project";
const URL_FINDING = "api/v1/finding";
const URL_LICENSE = "api/v1/license";
const URL_LICENSE_CONCISE = "api/v1/license/concise";
const URL_CWE = "api/v1/cwe";
const URL_COMPONENT = "api/v1/component";
const URL_DEPENDENCY = "api/v1/dependency";
const URL_VULNERABILITY = "api/v1/vulnerability";
const URL_ANALYSIS = "api/v1/analysis";
const URL_SEARCH = "api/v1/search";
const URL_METRICS = "api/v1/metrics";
const URL_CALCULATOR_CVSS = "api/v1/calculator/cvss";
const URL_REPOSITORY = "api/v1/repository";
const URL_CONFIG_PROPERTY = "api/v1/configProperty";
const URL_NOTIFICATION_PUBLISHER = "api/v1/notification/publisher";
const URL_NOTIFICATION_RULE = "api/v1/notification/rule";
const URL_LDAP_GROUPS = "api/v1/ldap/groups";
const URL_LDAP_MAPPING = "api/v1/ldap/mapping";
const URL_BOM = "api/v1/bom";

module.exports = {
  BASE_URL: BASE_URL,
  CONTENT_TYPE_JSON: CONTENT_TYPE_JSON,
  ENCODE_MULTIPART_FORM_DATA: ENCODE_MULTIPART_FORM_DATA,
  CONTENT_TYPE_TEXT: CONTENT_TYPE_TEXT,
  TOTAL_COUNT_HEADER: TOTAL_COUNT_HEADER,
  DATA_TYPE: DATA_TYPE,
  METHOD_GET: METHOD_GET,
  METHOD_POST: METHOD_POST,
  METHOD_PUT: METHOD_PUT,
  METHOD_DELETE: METHOD_DELETE,
  FORCE_PASSWORD_CHANGE: FORCE_PASSWORD_CHANGE,
  URL_ABOUT: URL_ABOUT,
  URL_LOGIN: URL_LOGIN,
  URL_FORCE_PW_CHANGE: URL_FORCE_PW_CHANGE,
  URL_TEAM: URL_TEAM,
  URL_USER: URL_USER,
  URL_USER_LDAP: URL_USER_LDAP,
  URL_USER_MANAGED: URL_USER_MANAGED,
  URL_USER_SELF: URL_USER_SELF,
  URL_PERMISSION: URL_PERMISSION,
  URL_PROJECT: URL_PROJECT,
  URL_FINDING: URL_FINDING,
  URL_LICENSE: URL_LICENSE,
  URL_LICENSE_CONCISE: URL_LICENSE_CONCISE,
  URL_CWE: URL_CWE,
  URL_COMPONENT: URL_COMPONENT,
  URL_DEPENDENCY: URL_DEPENDENCY,
  URL_VULNERABILITY: URL_VULNERABILITY,
  URL_ANALYSIS: URL_ANALYSIS,
  URL_SEARCH: URL_SEARCH,
  URL_METRICS: URL_METRICS,
  URL_CALCULATOR_CVSS: URL_CALCULATOR_CVSS,
  URL_REPOSITORY: URL_REPOSITORY,
  URL_CONFIG_PROPERTY: URL_CONFIG_PROPERTY,
  URL_NOTIFICATION_PUBLISHER: URL_NOTIFICATION_PUBLISHER,
  URL_NOTIFICATION_RULE: URL_NOTIFICATION_RULE,
  URL_LDAP_GROUPS: URL_LDAP_GROUPS,
  URL_LDAP_MAPPING: URL_LDAP_MAPPING,
  URL_BOM: URL_BOM
};
