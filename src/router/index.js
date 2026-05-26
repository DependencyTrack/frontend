import Vue from 'vue';
import Router from 'vue-router';
import i18n from '../i18n';
import EventBus from '../shared/eventbus';
import {
  getToken,
  getPermissions,
  hasPermission,
  storePermissions,
} from '../shared/permissions';
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
const VulnerabilityPolicyEditor = () =>
  import('@/views/policy/VulnerabilityPolicyEditor');
const Project = () => import('@/views/portfolio/projects/Project');
const PolicyViolationAudit = () => import('@/views/audit/PolicyViolationAudit');

const Administration = () => import('@/views/administration/Administration');
const General = () => import('@/views/administration/configuration/General');
const BomFormats = () =>
  import('@/views/administration/configuration/BomFormats');
const WelcomeMessage = () =>
  import('@/views/administration/configuration/WelcomeMessage');
const InternalComponents = () =>
  import('@/views/administration/configuration/InternalComponents');
const Maintenance = () =>
  import('@/views/administration/configuration/Maintenance');
const RiskScore = () =>
  import('@/views/administration/configuration/RiskScore');
const Telemetry = () =>
  import('@/views/administration/configuration/Telemetry.vue');
const SecretsManagement = () =>
  import('@/views/administration/secrets/SecretsManagement.vue');

const AnalyzerView = () => import('@/views/administration/analyzers/Index');

const VulnSourceView = () =>
  import('@/views/administration/vuln-sources/Index');

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
const Publishers = () =>
  import('@/views/administration/notifications/Publishers');

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
const TaskQueueList = () =>
  import('@/views/administration/workflows/TaskQueueList');
const WorkflowRunList = () =>
  import('@/views/administration/workflows/WorkflowRunList');
const WorkflowRunDetail = () =>
  import('@/views/administration/workflows/WorkflowRunDetail');

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
            permissions: ['VIEW_PORTFOLIO'],
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
            permissions: ['VIEW_PORTFOLIO'],
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
            permissions: ['VIEW_PORTFOLIO'],
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
            permissions: ['VIEW_PORTFOLIO'],
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
            permissions: ['VIEW_PORTFOLIO'],
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
            permissions: ['VIEW_PORTFOLIO'],
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
            permissions: ['VIEW_PORTFOLIO'],
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
            permissions: ['VIEW_PORTFOLIO'],
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
            permissions: ['VIEW_PORTFOLIO'],
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
            permissions: ['VIEW_PORTFOLIO'],
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
            permissions: ['VIEW_PORTFOLIO'],
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
            permissions: ['VIEW_PORTFOLIO'],
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
            permissions: ['VIEW_PORTFOLIO'],
          },
        },
        {
          path: 'policy/vulnerability/new',
          name: 'VulnerabilityPolicyCreate',
          component: VulnerabilityPolicyEditor,
          meta: {
            title: i18n.t('message.policy_editor_title_create'),
            i18n: 'message.policy_management',
            sectionPath: '/policy',
            sectionName: 'Policy Management',
            permissions: ['POLICY_MANAGEMENT', 'POLICY_MANAGEMENT_CREATE'],
          },
        },
        {
          path: 'policy/vulnerability/:uuid',
          name: 'VulnerabilityPolicyEdit',
          component: VulnerabilityPolicyEditor,
          props: (route) => ({ uuid: route.params.uuid }),
          meta: {
            title: i18n.t('message.vulnerability_policies'),
            i18n: 'message.policy_management',
            sectionPath: '/policy',
            sectionName: 'Policy Management',
            permissions: ['POLICY_MANAGEMENT', 'POLICY_MANAGEMENT_READ'],
          },
        },
        {
          path: 'policy',
          name: 'Policy Management',
          alias: [
            'policy/policies',
            'policy/licenseGroups',
            'policy/vulnerability',
          ],
          component: PolicyManagement,
          meta: {
            title: i18n.t('message.policy_management'),
            i18n: 'message.policy_management',
            sectionPath: '/policy',
            sectionName: 'Policy Management',
            permissions: [
              'POLICY_MANAGEMENT',
              'POLICY_MANAGEMENT_CREATE',
              'POLICY_MANAGEMENT_READ',
              'POLICY_MANAGEMENT_UPDATE',
              'POLICY_MANAGEMENT_DELETE',
            ],
          },
        },
        {
          path: 'policyViolationAudit',
          component: PolicyViolationAudit,
          meta: {
            title: i18n.t('message.policy_violation_audit'),
            i18n: 'message.policy_violation_audit',
            sectionPath: '/audit',
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
            permissions: [
              'SYSTEM_CONFIGURATION',
              'SYSTEM_CONFIGURATION_CREATE',
              'SYSTEM_CONFIGURATION_READ',
              'SYSTEM_CONFIGURATION_UPDATE',
              'SYSTEM_CONFIGURATION_DELETE',
            ],
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
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
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
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
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
              path: 'configuration/internalComponents',
              component: InternalComponents,
              meta: {
                title: i18n.t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
              },
            },
            {
              path: 'configuration/maintenance',
              component: Maintenance,
              meta: {
                title: i18n.t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
              },
            },
            {
              path: 'configuration/riskscore',
              component: RiskScore,
              meta: {
                title: i18n.t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
              },
            },
            {
              path: 'configuration/telemetry',
              component: Telemetry,
              meta: {
                title: i18n.t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
              },
            },
            {
              path: 'secrets/management',
              component: SecretsManagement,
              meta: {
                title: i18n.t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permissions: [
                  'SECRET_MANAGEMENT',
                  'SECRET_MANAGEMENT_CREATE',
                  'SECRET_MANAGEMENT_READ',
                  'SECRET_MANAGEMENT_UPDATE',
                  'SECRET_MANAGEMENT_DELETE',
                ],
              },
            },
            {
              path: 'analyzers',
              redirect: 'analyzers/internal',
            },
            {
              path: 'analyzers/:extensionName',
              component: AnalyzerView,
              meta: {
                title: i18n.t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
              },
            },
            {
              path: 'vulnerabilitySources',
              redirect: 'vulnerabilitySources/nvd',
            },
            {
              path: 'vulnerabilitySources/:extensionName',
              component: VulnSourceView,
              meta: {
                title: i18n.t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
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
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
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
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
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
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
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
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
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
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
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
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
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
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
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
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
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
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
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
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
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
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
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
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
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
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
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
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
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
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
              },
            },
            {
              path: 'notifications/publishers',
              component: Publishers,
              meta: {
                title: i18n.t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
              },
            },
            {
              path: 'notifications/publishers/:extensionName',
              component: Publishers,
              meta: {
                title: i18n.t('message.administration'),
                i18n: 'message.administration',
                sectionPath: '/admin',
                sectionName: 'Admin',
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
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
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
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
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
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
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_CREATE',
                  'SYSTEM_CONFIGURATION_READ',
                  'SYSTEM_CONFIGURATION_UPDATE',
                  'SYSTEM_CONFIGURATION_DELETE',
                ],
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
                permissions: [
                  'ACCESS_MANAGEMENT',
                  'ACCESS_MANAGEMENT_CREATE',
                  'ACCESS_MANAGEMENT_READ',
                  'ACCESS_MANAGEMENT_UPDATE',
                  'ACCESS_MANAGEMENT_DELETE',
                ],
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
                permissions: [
                  'ACCESS_MANAGEMENT',
                  'ACCESS_MANAGEMENT_CREATE',
                  'ACCESS_MANAGEMENT_READ',
                  'ACCESS_MANAGEMENT_UPDATE',
                  'ACCESS_MANAGEMENT_DELETE',
                ],
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
                permissions: [
                  'ACCESS_MANAGEMENT',
                  'ACCESS_MANAGEMENT_CREATE',
                  'ACCESS_MANAGEMENT_READ',
                  'ACCESS_MANAGEMENT_UPDATE',
                  'ACCESS_MANAGEMENT_DELETE',
                ],
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
                permissions: [
                  'ACCESS_MANAGEMENT',
                  'ACCESS_MANAGEMENT_CREATE',
                  'ACCESS_MANAGEMENT_READ',
                  'ACCESS_MANAGEMENT_UPDATE',
                  'ACCESS_MANAGEMENT_DELETE',
                ],
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
                permissions: [
                  'ACCESS_MANAGEMENT',
                  'ACCESS_MANAGEMENT_CREATE',
                  'ACCESS_MANAGEMENT_READ',
                  'ACCESS_MANAGEMENT_UPDATE',
                  'ACCESS_MANAGEMENT_DELETE',
                ],
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
                permissions: [
                  'ACCESS_MANAGEMENT',
                  'ACCESS_MANAGEMENT_CREATE',
                  'ACCESS_MANAGEMENT_READ',
                  'ACCESS_MANAGEMENT_UPDATE',
                  'ACCESS_MANAGEMENT_DELETE',
                ],
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
                permissions: [
                  'ACCESS_MANAGEMENT',
                  'ACCESS_MANAGEMENT_CREATE',
                  'ACCESS_MANAGEMENT_READ',
                  'ACCESS_MANAGEMENT_UPDATE',
                  'ACCESS_MANAGEMENT_DELETE',
                ],
              },
            },
            {
              path: 'workflows/taskQueues',
              component: TaskQueueList,
              meta: {
                title: i18n.t('admin.task_queues'),
                i18n: 'admin.task_queues',
                sectionPath: '/taskQueues',
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_READ',
                ],
              },
            },
            {
              path: 'workflows/runs',
              name: 'WorkflowRunList',
              component: WorkflowRunList,
              meta: {
                title: i18n.t('admin.workflow_runs'),
                i18n: 'admin.workflow_runs',
                sectionPath: '/workflowRuns',
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_READ',
                ],
              },
            },
            {
              path: 'workflows/runs/:id',
              name: 'WorkflowRunDetail',
              props: (route) => ({ id: route.params.id }),
              component: WorkflowRunDetail,
              meta: {
                i18n: 'admin.workflow_runs',
                sectionPath: '/workflowRuns',
                permissions: [
                  'SYSTEM_CONFIGURATION',
                  'SYSTEM_CONFIGURATION_READ',
                ],
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
            permissions: ['VIEW_VULNERABILITY'],
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

  if (to.meta.permissions) {
    // non-public route, check permissions
    const token = getToken();
    if (token) {
      const checkAndProceed = () => {
        const isAllowed = to.meta.permissions.some((permission) =>
          hasPermission(permission),
        );
        if (isAllowed) {
          // let backend verify the token
          router.app.axios
            .get(
              `${router.app.$api.BASE_URL}/${router.app.$api.URL_USER_SELF}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            )
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
      };

      if (getPermissions().length === 0) {
        // permissions missing (e.g. after storage cleared), re-fetch before deciding
        router.app.axios
          .get(
            `${router.app.$api.BASE_URL}/${router.app.$api.URL_USER_SELF_PERMISSIONS}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          )
          .then((result) => {
            if (!Array.isArray(result.data)) {
              throw new Error(
                `Unexpected permissions response: ${JSON.stringify(result.data)}`,
              );
            }
            storePermissions(result.data);
            checkAndProceed();
          })
          .catch(() => {
            EventBus.$emit('authenticated', null);
            redirectToLogin();
          });
      } else {
        checkAndProceed();
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
