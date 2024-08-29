import { createRouter, createWebHistory } from 'vue-router';
import i18n from '../i18n';
import EventBus from '../shared/eventbus';
import { getToken, hasPermission } from '../shared/permissions';
import { getContextPath } from '../shared/utils';

const { t } = i18n.global;

// Containers
const DefaultContainer = () => import('@/containers/DefaultContainer.vue');

// Views
const Dashboard = () => import('@/views/Dashboard.vue');
const ProjectList = () => import('@/views/portfolio/projects/ProjectList.vue');
const TagList = () => import('@/views/portfolio/tags/TagList.vue');
const ComponentSearch = () =>
  import('@/views/portfolio/components/ComponentSearch.vue');
const VulnerabilityList = () =>
  import('@/views/portfolio/vulnerabilities/VulnerabilityList.vue');
const VulnerabilityAudit = () =>
  import('@/views/globalAudit/VulnerabilityAudit.vue');
const LicenseList = () => import('@/views/portfolio/licenses/LicenseList.vue');
const PolicyManagement = () => import('@/views/policy/PolicyManagement.vue');
const Project = () => import('@/views/portfolio/projects/Project.vue');

const PolicyViolationAudit = () => import('@/views/audit/PolicyViolationAudit.vue');

const Administration = () => import('@/views/administration/Administration.vue');
const General = () => import('@/views/administration/configuration/General.vue');
const BomFormats = () =>
  import('@/views/administration/configuration/BomFormats.vue');
const WelcomeMessage = () =>
  import('@/views/administration/configuration/WelcomeMessage.vue');
const Email = () => import('@/views/administration/configuration/Email.vue');
const Jira = () => import('@/views/administration/configuration/JiraConfig.vue');
const InternalComponents = () =>
  import('@/views/administration/configuration/InternalComponents.vue');
const TaskScheduler = () =>
  import('@/views/administration/configuration/TaskScheduler.vue');
const Search = () => import('@/views/administration/configuration/Search.vue');
const Experimental = () =>
  import('@/views/administration/configuration/Experimental.vue');

const InternalAnalyzer = () =>
  import('@/views/administration/analyzers/InternalAnalyzer.vue');
const OssIndexAnalyzer = () =>
  import('@/views/administration/analyzers/OssIndexAnalyzer.vue');
const VulnDbAnalyzer = () =>
  import('@/views/administration/analyzers/VulnDbAnalyzer.vue');
const SnykAnalyzer = () =>
  import('@/views/administration/analyzers/SnykAnalyzer.vue');
const TrivyAnalyzer = () =>
  import('@/views/administration/analyzers/TrivyAnalyzer.vue');

const VulnSourceNvd = () =>
  import('@/views/administration/vuln-sources/VulnSourceNvd.vue');
const VulnSourceGitHubAdvisories = () =>
  import('@/views/administration/vuln-sources/VulnSourceGitHubAdvisories.vue');
const VulnSourceOSVAdvisories = () =>
  import('@/views/administration/vuln-sources/VulnSourceOSVAdvisories.vue');

const Cargo = () => import('@/views/administration/repositories/Cargo.vue');
const Composer = () => import('@/views/administration/repositories/Composer.vue');
const Cpan = () => import('@/views/administration/repositories/Cpan.vue');
const Gem = () => import('@/views/administration/repositories/Gem.vue');
const GitHub = () => import('@/views/administration/repositories/GitHub.vue');
const GoModules = () => import('@/views/administration/repositories/GoModules.vue');
const Hackage = () => import('@/views/administration/repositories/Hackage.vue');
const Hex = () => import('@/views/administration/repositories/Hex.vue');
const Maven = () => import('@/views/administration/repositories/Maven.vue');
const Nixpkgs = () => import('@/views/administration/repositories/Nixpkgs.vue');
const Npm = () => import('@/views/administration/repositories/Npm.vue');
const Nuget = () => import('@/views/administration/repositories/Nuget.vue');
const Python = () => import('@/views/administration/repositories/Python.vue');

const Alerts = () => import('@/views/administration/notifications/Alerts.vue');
const Templates = () =>
  import('@/views/administration/notifications/Templates.vue');

const FortifySsc = () =>
  import('@/views/administration/integrations/FortifySsc.vue');
const DefectDojo = () =>
  import('@/views/administration/integrations/DefectDojo.vue');
const KennaSecurity = () =>
  import('@/views/administration/integrations/KennaSecurity.vue');

const LdapUsers = () =>
  import('@/views/administration/accessmanagement/LdapUsers.vue');
const ManagedUsers = () =>
  import('@/views/administration/accessmanagement/ManagedUsers.vue');
const OidcUsers = () =>
  import('@/views/administration/accessmanagement/OidcUsers.vue');
const OidcGroups = () =>
  import('@/views/administration/accessmanagement/OidcGroups.vue');
const Teams = () => import('@/views/administration/accessmanagement/Teams.vue');
const Permissions = () =>
  import('@/views/administration/accessmanagement/Permissions.vue');
const PortfolioAccessControl = () =>
  import('@/views/administration/accessmanagement/PortfolioAccessControl.vue');

const Component = () => import('@/views/portfolio/projects/Component.vue');
const Service = () => import('@/views/portfolio/projects/Service.vue');
const Vulnerability = () =>
  import('@/views/portfolio/vulnerabilities/Vulnerability.vue');
const License = () => import('@/views/portfolio/licenses/License.vue');

// Pages
const Login = () => import('@/views/pages/Login.vue');
const PasswordForceChange = () => import('@/views/pages/PasswordForceChange.vue');
const Page404 = () => import('@/views/pages/Page404.vue');

function configRoutes() {
  return [
    {
      path: '/',
      redirect: '/dashboard',
      name: 'Home',
      component: DefaultContainer,
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: Dashboard,
          meta: {
            title: t('message.dashboard'),
            i18n: 'message.dashboard',
            sectionPath: '/dashboard',
            sectionName: 'Dashboard',
            permission: 'VIEW_PORTFOLIO',
          },
        },
        {
          path: 'projects',
          name: 'Projects',
          component: ProjectList,
          meta: {
            title: t('message.projects'),
            i18n: 'message.projects',
            sectionPath: '/projects',
            sectionName: 'Projects',
            permission: 'VIEW_PORTFOLIO',
          },
        },
        {
          path: 'projects/:uuid',
          name: 'Project',
          alias: [
            'projects/:uuid/overview',
            'projects/:uuid/components',
            'projects/:uuid/services',
            'projects/:uuid/dependencyGraph',
            'projects/:uuid/findings',
            'projects/:uuid/epss',
            'projects/:uuid/policyViolations',
          ],
          props: (route) => ({ uuid: route.params.uuid }),
          component: Project,
          meta: {
            i18n: 'message.projects',
            sectionPath: '/projects',
            sectionName: 'Projects',
            permission: 'VIEW_PORTFOLIO',
          },
        },
        {
          path: 'projects/:uuid/dependencyGraph/:componentUuids',
          name: 'Dependency Graph Component Lookup',
          props: (route) => ({
            uuid: route.params.uuid,
            componentUuids: route.params.componentUuids,
          }),
          component: Project,
          meta: {
            i18n: 'message.projects',
            sectionPath: '/projects',
            sectionName: 'Projects',
            permission: 'VIEW_PORTFOLIO',
          },
        },
        {
          path: 'projects/:uuid/findings/:vulnerability',
          name: 'Project Vulnerability Lookup',
          props: (route) => ({
            uuid: route.params.uuid,
            vulnerability: route.params.vulnerability,
          }),
          component: Project,
          meta: {
            i18n: 'message.projects',
            sectionPath: '/projects',
            sectionName: 'Projects',
            permission: 'VIEW_PORTFOLIO',
          },
        },
        {
          path: 'projects/:uuid/findings/:affectedComponent/:vulnerability',
          name: 'Project Finding Lookup',
          props: (route) => ({
            uuid: route.params.uuid,
            affectedComponent: route.params.componentUuid,
            vulnerability: route.params.vulnerability,
          }),
          component: Project,
          meta: {
            i18n: 'message.projects',
            sectionPath: '/projects',
            sectionName: 'Projects',
            permission: 'VIEW_PORTFOLIO',
          },
        },
        {
          path: 'components',
          name: 'Component Lookup',
          component: ComponentSearch,
          meta: {
            title: t('message.component_search'),
            i18n: 'message.component_search',
            sectionPath: '/components',
            sectionName: 'Component Lookup',
            permission: 'VIEW_PORTFOLIO',
          },
        },
        {
          path: '/components/:uuid',
          name: 'Component',
          alias: [
            '/components/:uuid/overview',
            '/components/:uuid/vulnerabilities',
          ],
          props: (route) => ({ uuid: route.params.uuid }),
          component: Component,
          meta: {
            i18n: 'message.projects',
            sectionPath: '/projects',
            sectionName: 'Projects',
            permission: 'VIEW_PORTFOLIO',
          },
        },
        {
          path: '/services/:uuid',
          name: 'Service',
          props: (route) => ({ uuid: route.params.uuid }),
          component: Service,
          meta: {
            i18n: 'message.projects',
            sectionPath: '/projects',
            sectionName: 'Projects',
            permission: 'VIEW_PORTFOLIO',
          },
        },
        {
          path: 'vulnerabilities',
          name: 'Vulnerabilities',
          component: VulnerabilityList,
          meta: {
            title: t('message.vulnerabilities'),
            i18n: 'message.vulnerabilities',
            sectionPath: '/vulnerabilities',
            sectionName: 'Vulnerabilities',
            permission: 'VIEW_PORTFOLIO',
          },
        },
        {
          path: 'vulnerabilities/:source/:vulnId',
          name: 'Vulnerability',
          alias: [
            'vulnerabilities/:source/:vulnId/overview',
            'vulnerabilities/:source/:vulnId/affectedProjects',
          ],
          props: (route) => ({
            source: route.params.source,
            vulnId: route.params.vulnId,
          }),
          component: Vulnerability,
          meta: {
            i18n: 'message.vulnerabilities',
            sectionPath: '/vulnerabilities',
            sectionName: 'Vulnerabilities',
            permission: 'VIEW_PORTFOLIO',
          },
        },
        {
          path: 'tags',
          name: 'Tags',
          component: TagList,
          meta: {
            title: t('message.tags'),
            i18n: 'message.tags',
            sectionPath: '/tags',
            sectionName: 'Tags',
            permission: 'VIEW_PORTFOLIO',
          },
        },
        {
          path: 'licenses',
          name: 'Licenses',
          component: LicenseList,
          meta: {
            title: t('message.licenses'),
            i18n: 'message.licenses',
            sectionPath: '/licenses',
            sectionName: 'Licenses',
            permission: 'VIEW_PORTFOLIO',
          },
        },
        {
          path: 'licenses/:licenseId',
          name: 'License',
          alias: [
            'licenses/:licenseId/overview',
            'licenses/:licenseId/licenseText',
            'licenses/:licenseId/template',
            'licenses/:licenseId/header',
          ],
          props: (route) => ({ licenseId: route.params.licenseId }),
          component: License,
          meta: {
            i18n: 'message.licenses',
            sectionPath: '/licenses',
            sectionName: 'Licenses',
            permission: 'VIEW_PORTFOLIO',
          },
        },
        {
          path: 'policy',
          name: 'Policy Management',
          alias: ['policy/policies', 'policy/licenseGroups'],
          component: PolicyManagement,
          meta: {
            title: t('message.policy_management'),
            i18n: 'message.policy_management',
            sectionPath: '/policy',
            sectionName: 'Policy Management',
            permission: 'POLICY_MANAGEMENT',
          },
        },
        {
          path: 'policyViolationAudit',
          name: 'Policy Violation Audit',
          component: PolicyViolationAudit,
          meta: {
            title: i18n.t('message.policy_violation_audit'),
            i18n: 'message.policy_violation_audit',
            sectionPath: '/policyViolationAudit',
            sectionName: 'Policy Violation Audit',
            permission: 'VIEW_POLICY_VIOLATION',
          },
        },
        {
          path: 'admin',
          name: 'Admin',
          component: Administration,
          meta: {
            title: t('message.administration'),
            i18n: 'message.administration',
            sectionPath: '/admin',
            sectionName: 'Admin',
            permission: 'SYSTEM_CONFIGURATION',
          },
          children: [
            {
              path: '',
              name: 'Administration',
              alias: ['configuration', 'configuration/general'],
              component: General,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'configuration/bomFormats',
              component: BomFormats,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'configuration/welcomeMessage',
              component: WelcomeMessage,
              meta: {
                title: i18n.t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'configuration/email',
              component: Email,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'integrations/jira',
              component: Jira,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'configuration/internalComponents',
              component: InternalComponents,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'configuration/taskScheduler',
              component: TaskScheduler,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'configuration/search',
              component: Search,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'configuration/experimental',
              component: Experimental,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'analyzers/internal',
              alias: ['analyzers'],
              component: InternalAnalyzer,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'analyzers/oss',
              component: OssIndexAnalyzer,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'analyzers/vulnDB',
              component: VulnDbAnalyzer,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'analyzers/snyk',
              component: SnykAnalyzer,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'analyzers/trivy',
              component: TrivyAnalyzer,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'vulnerabilitySources/nvd',
              alias: ['vulnerabilitySources'],
              component: VulnSourceNvd,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'vulnerabilitySources/github',
              component: VulnSourceGitHubAdvisories,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'vulnerabilitySources/osv',
              component: VulnSourceOSVAdvisories,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'repositories/cargo',
              alias: ['repositories'],
              component: Cargo,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'repositories/composer',
              component: Composer,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'repositories/cpan',
              component: Cpan,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'repositories/gem',
              component: Gem,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'repositories/github',
              component: GitHub,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'repositories/goModules',
              component: GoModules,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'repositories/hackage',
              component: Hackage,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'repositories/hex',
              component: Hex,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'repositories/maven',
              component: Maven,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'repositories/nixpkgs',
              component: Nixpkgs,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'repositories/npm',
              component: Npm,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'repositories/nuget',
              component: Nuget,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'repositories/python',
              component: Python,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'notifications/alerts',
              alias: ['notifications'],
              component: Alerts,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'notifications/templates',
              component: Templates,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'integrations/fortifySSC',
              alias: ['integrations'],
              component: FortifySsc,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'integrations/defectDojo',
              component: DefectDojo,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'integrations/kennaSecurity',
              component: KennaSecurity,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'accessManagement/ldapUsers',
              alias: ['accessManagement'],
              component: LdapUsers,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'ACCESS_MANAGEMENT',
              },
            },
            {
              path: 'accessManagement/managedUsers',
              component: ManagedUsers,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'ACCESS_MANAGEMENT',
              },
            },
            {
              path: 'accessManagement/oidcUsers',
              component: OidcUsers,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'ACCESS_MANAGEMENT',
              },
            },
            {
              path: 'accessManagement/oidcGroups',
              component: OidcGroups,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'ACCESS_MANAGEMENT',
              },
            },
            {
              path: 'accessManagement/teams',
              component: Teams,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'ACCESS_MANAGEMENT',
              },
            },
            {
              path: 'accessManagement/permissions',
              component: Permissions,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'ACCESS_MANAGEMENT',
              },
            },
            {
              path: 'accessManagement/portfolioAccessControl',
              component: PortfolioAccessControl,
              meta: {
                title: t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'ACCESS_MANAGEMENT',
              },
            },
          ],
        },
        {
          path: 'vulnerabilityAudit',
          name: 'Vulnerability Audit',
          alias: [
            'vulnerabilityAudit/occurrences',
            'vulnerabilityAudit/grouped',
          ],
          component: VulnerabilityAudit,
          meta: {
            title: t('message.vulnerability_audit'),
            i18n: 'message.vulnerability_audit',
            sectionPath: '/vulnerabilityAudit',
            sectionName: 'Vulnerability Audit',
            permission: 'VIEW_VULNERABILITY',
          },
        },
        // The following route redirects URLs from legacy Dependency-Track UI to new URL format.
        {
          // Old: http://host/project/?uuid=3a38aedf-e9e9-4e0a-8913-2d99951aa76d
          // New: http://host/projects/3a38aedf-e9e9-4e0a-8913-2d99951aa76d
          path: 'project',
          props: (route) => ({ uuid: route.query.uuid }),
          redirect: (to) => {
            let { hash, params, query } = to;
            if (query.uuid) {
              let uuid = query.uuid;
              return { path: '/projects/' + uuid, query: null };
            }
          },
        },
        {
          // Old: http://host/component/?uuid=3a38aedf-e9e9-4e0a-8913-2d99951aa76d
          // New: http://host/components/3a38aedf-e9e9-4e0a-8913-2d99951aa76d
          path: 'component',
          props: (route) => ({ uuid: route.query.uuid }),
          redirect: (to) => {
            let { hash, params, query } = to;
            if (query.uuid) {
              let uuid = query.uuid;
              return { path: '/components/' + uuid, query: null };
            }
          },
        },
        {
          // Old: http://host/vulnerability/?source=NVD&vulnId=CVE-2019-10966
          // New: http://host/vulnerabilities/NVD/CVE-2019-10966
          path: 'vulnerability',
          props: (route) => ({
            source: route.query.source,
            vulnId: route.query.vulnId,
          }),
          redirect: (to) => {
            let { hash, params, query } = to;
            if (query.source && query.vulnId) {
              return {
                path: '/vulnerabilities/' + query.source + '/' + query.vulnId,
                query: null,
              };
            }
          },
        },
        {
          // Old: http://host/license/?licenseId=AFL-2.0
          // New: http://host/licenses/AFL-2.0
          path: 'license',
          props: (route) => ({ licenseId: route.query.licenseId }),
          redirect: (to) => {
            let { hash, params, query } = to;
            if (query.licenseId) {
              let licenseId = query.licenseId;
              return { path: '/licenses/' + licenseId, query: null };
            }
          },
        },
      ],
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        title: t('message.login'),
      },
    },
    {
      path: '/change-password',
      name: 'PasswordForceChange',
      component: PasswordForceChange,
      meta: {
        title: t('message.change_password'),
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      component: Page404,
      meta: {
        title: t('404.heading'),
      },
    },
  ];
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  base: getContextPath(),
  linkActiveClass: 'open active',
  scrollBehavior: (to, from, savedPosition) => savedPosition || { top: 0 },
  routes: configRoutes(),
});

router.beforeEach((to, from, next) => {
  const redirectToLogin = () => {
    next({ name: 'Login', query: { redirect: to.fullPath }, replace: true });
  };

  if (to.meta.permission) {
    // non-public route, check permissions
    const jwt = getToken();
    if (jwt) {
      if (hasPermission(to.meta.permission)) {
        // let backend verify the token
        router.app.axios
          .get(`${router.app.$api.BASE_URL}/${router.app.$api.URL_USER_SELF}`, {
            headers: { Authorization: `Bearer ${jwt}` },
          })
          .then((result) => {
            Vue.prototype.$currentUser = result.data;
            // allowed to proceed
            next();
          })
          .catch(() => {
            // token is stale
            // notify app about this
            EventBus.$emit('authenticated', null);
            // redirect to login page
            redirectToLogin();
          });
      } else {
        Vue.prototype.$toastr.e(t('condition.forbidden'));
        next({ name: 'Dashboard', replace: true });
      }
    } else {
      // no token at all, redirect to login page
      redirectToLogin();
    }
  } else {
    // public route, allowed to proceed
    next();
  }
});

export default router;
