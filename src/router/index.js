import Vue from 'vue';
import Router from 'vue-router';
import i18n from '../i18n';
import EventBus from '../shared/eventbus';
import { getToken, hasPermission } from '../shared/permissions';
import { getContextPath } from '../shared/utils';

// Containers
const DefaultContainer = () => import('@/containers/DefaultContainer');

// Views
const Dashboard = () => import('@/views/Dashboard');
const ProjectListView = () =>
  import('@/views/portfolio/projects/ProjectListView');
const TagList = () => import('@/views/portfolio/tags/TagList.vue');
const ComponentSearch = () =>
  import('@/views/portfolio/components/ComponentSearch');
const VulnerabilityList = () =>
  import('@/views/portfolio/vulnerabilities/VulnerabilityList');
const VulnerabilityAudit = () =>
  import('@/views/globalAudit/VulnerabilityAudit');
const LicenseList = () => import('@/views/portfolio/licenses/LicenseList');
const PolicyManagement = () => import('@/views/policy/PolicyManagement');
const Project = () => import('@/views/portfolio/projects/Project');

const PolicyViolationAudit = () => import('@/views/audit/PolicyViolationAudit');

const Administration = () => import('@/views/administration/Administration');
const General = () => import('@/views/administration/configuration/General');
const BomFormats = () =>
  import('@/views/administration/configuration/BomFormats');
const WelcomeMessage = () =>
  import('@/views/administration/configuration/WelcomeMessage');
const Email = () => import('@/views/administration/configuration/Email');
const Jira = () => import('@/views/administration/configuration/JiraConfig');
const InternalComponents = () =>
  import('@/views/administration/configuration/InternalComponents');
const TaskScheduler = () =>
  import('@/views/administration/configuration/TaskScheduler');
const Search = () => import('@/views/administration/configuration/Search');
const Experimental = () =>
  import('@/views/administration/configuration/Experimental');

const InternalAnalyzer = () =>
  import('@/views/administration/analyzers/InternalAnalyzer');
const OssIndexAnalyzer = () =>
  import('@/views/administration/analyzers/OssIndexAnalyzer');
const VulnDbAnalyzer = () =>
  import('@/views/administration/analyzers/VulnDbAnalyzer');
const SnykAnalyzer = () =>
  import('@/views/administration/analyzers/SnykAnalyzer');
const TrivyAnalyzer = () =>
  import('@/views/administration/analyzers/TrivyAnalyzer');

const VulnSourceNvd = () =>
  import('@/views/administration/vuln-sources/VulnSourceNvd');
const VulnSourceGitHubAdvisories = () =>
  import('@/views/administration/vuln-sources/VulnSourceGitHubAdvisories');
const VulnSourceOSVAdvisories = () =>
  import('@/views/administration/vuln-sources/VulnSourceOSVAdvisories');
const VulnSourceComposerAdvisories = () =>
  import('@/views/administration/vuln-sources/VulnSourceComposerAdvisories');

const Cargo = () => import('@/views/administration/repositories/Cargo');
const Composer = () => import('@/views/administration/repositories/Composer');
const Cpan = () => import('@/views/administration/repositories/Cpan');
const Gem = () => import('@/views/administration/repositories/Gem');
const GitHub = () => import('@/views/administration/repositories/GitHub.vue');
const GoModules = () => import('@/views/administration/repositories/GoModules');
const Hackage = () => import('@/views/administration/repositories/Hackage');
const Hex = () => import('@/views/administration/repositories/Hex');
const Maven = () => import('@/views/administration/repositories/Maven');
const Nixpkgs = () => import('@/views/administration/repositories/Nixpkgs');
const Npm = () => import('@/views/administration/repositories/Npm');
const Nuget = () => import('@/views/administration/repositories/Nuget');
const Python = () => import('@/views/administration/repositories/Python');

const Alerts = () => import('@/views/administration/notifications/Alerts');
const Templates = () =>
  import('@/views/administration/notifications/Templates');

const FortifySsc = () =>
  import('@/views/administration/integrations/FortifySsc');
const DefectDojo = () =>
  import('@/views/administration/integrations/DefectDojo');
const KennaSecurity = () =>
  import('@/views/administration/integrations/KennaSecurity');

const LdapUsers = () =>
  import('@/views/administration/accessmanagement/LdapUsers');
const ManagedUsers = () =>
  import('@/views/administration/accessmanagement/ManagedUsers');
const OidcUsers = () =>
  import('@/views/administration/accessmanagement/OidcUsers');
const OidcGroups = () =>
  import('@/views/administration/accessmanagement/OidcGroups');
const Teams = () => import('@/views/administration/accessmanagement/Teams');
const Permissions = () =>
  import('@/views/administration/accessmanagement/Permissions');
const PortfolioAccessControl = () =>
  import('@/views/administration/accessmanagement/PortfolioAccessControl');

const Component = () => import('@/views/portfolio/projects/Component');
const Service = () => import('@/views/portfolio/projects/Service');
const Vulnerability = () =>
  import('@/views/portfolio/vulnerabilities/Vulnerability');
const License = () => import('@/views/portfolio/licenses/License');

// Pages
const Login = () => import('@/views/pages/Login');
const PasswordForceChange = () => import('@/views/pages/PasswordForceChange');
const Page404 = () => import('@/views/pages/Page404');

Vue.use(Router);

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
            title: i18n.t('message.dashboard'),
            i18n: 'message.dashboard',
            sectionPath: '/dashboard',
            sectionName: 'Dashboard',
            permission: 'VIEW_PORTFOLIO',
          },
        },
        {
          path: 'projects',
          name: 'Projects',
          component: ProjectListView,
          meta: {
            title: i18n.t('message.projects'),
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
            'projects/:uuid/collectionprojects',
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
            title: i18n.t('message.component_search'),
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
            title: i18n.t('message.vulnerabilities'),
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
            title: i18n.t('message.tags'),
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
            title: i18n.t('message.licenses'),
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
            title: i18n.t('message.policy_management'),
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
            title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permission: 'SYSTEM_CONFIGURATION',
              },
            },
            {
              path: 'vulnerabilitySources/composer',
              component: VulnSourceComposerAdvisories,
              meta: {
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
                title: i18n.t('message.administration'),
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
            title: i18n.t('message.vulnerability_audit'),
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
        title: i18n.t('message.login'),
      },
    },
    {
      path: '/change-password',
      name: 'PasswordForceChange',
      component: PasswordForceChange,
      meta: {
        title: i18n.t('message.change_password'),
      },
    },
    {
      path: '*',
      name: '404',
      component: Page404,
      meta: {
        title: i18n.t('404.heading'),
      },
    },
  ];
}

const router = new Router({
  mode: 'history', // https://router.vuejs.org/api/#mode
  base: getContextPath(),
  linkActiveClass: 'open active',
  scrollBehavior: () => ({ y: 0 }),
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
        Vue.prototype.$toastr.e(i18n.t('condition.forbidden'));
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
