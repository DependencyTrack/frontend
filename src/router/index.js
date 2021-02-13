import Vue from 'vue'
import Router from 'vue-router'
import i18n from '../i18n'
import { getContextPath } from "../shared/utils"
import { getToken }  from '../shared/permissions';
import EventBus from '../shared/eventbus';

// Containers
const DefaultContainer = () => import('@/containers/DefaultContainer');

// Views
const Dashboard = () => import('@/views/Dashboard');
const ProjectList = () => import('@/views/portfolio/projects/ProjectList');
const ComponentSearch = () => import('@/views/portfolio/components/ComponentSearch');
const VulnerabilityList = () => import('@/views/portfolio/vulnerabilities/VulnerabilityList');
const LicenseList = () => import('@/views/portfolio/licenses/LicenseList');
const Administration = () => import('@/views/administration/Administration');
const PolicyManagement = () => import('@/views/policy/PolicyManagement');

const Project = () => import('@/views/portfolio/projects/Project');
const Component = () => import('@/views/portfolio/projects/Component');
const Vulnerability = () => import('@/views/portfolio/vulnerabilities/Vulnerability');
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
            sectionPath: '/dashboard'
          }
        },
        {
          path: 'projects',
          name: 'Projects',
          component: ProjectList,
          meta: {
            title: i18n.t('message.projects'),
            i18n: 'message.projects',
            sectionPath: '/projects'
          }
        },
        {
          path: 'projects/:uuid',
          name: 'Project',
          props: (route) => ( { uuid: route.params.uuid } ),
          component: Project,
          meta: {
            i18n: 'message.projects',
            sectionPath: '/projects'
          }
        },
        {
          path: 'components',
          name: 'Component Lookup',
          component: ComponentSearch,
          meta: {
            title: i18n.t('message.component_search'),
            i18n: 'message.component_search',
            sectionPath: '/components'
          }
        },
        {
          path: '/components/:uuid',
          name: 'Component',
          props: (route) => ( { uuid: route.params.uuid } ),
          component: Component,
          meta: {
            i18n: 'message.projects',
            sectionPath: '/projects'
          }
        },
        {
          path: 'vulnerabilities',
          name: 'Vulnerabilities',
          component: VulnerabilityList,
          meta: {
            title: i18n.t('message.vulnerabilities'),
            i18n: 'message.vulnerabilities',
            sectionPath: '/vulnerabilities'
          }
        },
        {
          path: 'vulnerabilities/:source/:vulnId',
          name: 'Vulnerability',
          props: (route) => ( {
            source: route.params.source,
            vulnId: route.params.vulnId
          } ),
          component: Vulnerability,
          meta: {
            i18n: 'message.vulnerabilities',
            sectionPath: '/vulnerabilities'
          }
        },
        {
          path: 'licenses',
          name: 'Licenses',
          component: LicenseList,
          meta: {
            title: i18n.t('message.licenses'),
            i18n: 'message.licenses',
            sectionPath: '/licenses'
          }
        },
        {
          path: 'licenses/:licenseId',
          name: 'License',
          props: (route) => ( { licenseId: route.params.licenseId } ),
          component: License,
          meta: {
            i18n: 'message.licenses',
            sectionPath: '/licenses'
          }
        },
        {
          path: 'policy',
          name: 'Policy Management',
          component: PolicyManagement,
          meta: {
            title: i18n.t('message.policy_management'),
            i18n: 'message.policy_management',
            sectionPath: '/policy'
          }
        },
        {
          path: 'admin',
          name: 'Administration',
          component: Administration,
          meta: {
            title: i18n.t('message.administration'),
            i18n: 'message.administration',
            sectionPath: '/admin'
          }
        },
        // The following route redirects URLs from legacy Dependency-Track UI to new URL format.
        {
          // Old: http://host/project/?uuid=3a38aedf-e9e9-4e0a-8913-2d99951aa76d
          // New: http://host/projects/3a38aedf-e9e9-4e0a-8913-2d99951aa76d
          path: 'project',
          props: (route) => ( { uuid: route.query.uuid } ),
          redirect: to => {
            let { hash, params, query } = to;
            if (query.uuid) {
              let uuid = query.uuid;
              return { path: '/projects/' + uuid, query: null }
            }
          }
        },
        {
          // Old: http://host/component/?uuid=3a38aedf-e9e9-4e0a-8913-2d99951aa76d
          // New: http://host/components/3a38aedf-e9e9-4e0a-8913-2d99951aa76d
          path: 'component',
          props: (route) => ( { uuid: route.query.uuid } ),
          redirect: to => {
            let { hash, params, query } = to;
            if (query.uuid) {
              let uuid = query.uuid;
              return { path: '/components/' + uuid, query: null }
            }
          }
        },
        {
          // Old: http://host/vulnerability/?source=NVD&vulnId=CVE-2019-10966
          // New: http://host/vulnerabilities/NVD/CVE-2019-10966
          path: 'vulnerability',
          props: (route) => ( {
            source: route.query.source,
            vulnId: route.query.vulnId,
          } ),
          redirect: to => {
            let { hash, params, query } = to;
            if (query.source && query.vulnId) {
              return { path: '/vulnerabilities/' + query.source + "/" + query.vulnId, query: null }
            }
          }
        },
        {
          // Old: http://host/license/?licenseId=AFL-2.0
          // New: http://host/licenses/AFL-2.0
          path: 'license',
          props: (route) => ( { licenseId: route.query.licenseId } ),
          redirect: to => {
            let { hash, params, query } = to;
            if (query.licenseId) {
              let licenseId = query.licenseId;
              return { path: '/licenses/' + licenseId, query: null }
            }
          }
        },
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        title: i18n.t('message.login'),
      }
    },
    {
      path: '/change-password',
      name: 'PasswordForceChange',
      component: PasswordForceChange,
      meta: {
        title: i18n.t('message.change_password'),
      }
    },
    {
      path: '*',
      name: '404',
      component: Page404,
      meta: {
        title: i18n.t('404.heading'),
      }
    }
  ]
}

const router = new Router({
  mode: 'history', // https://router.vuejs.org/api/#mode
  base: getContextPath(),
  linkActiveClass: 'open active',
  scrollBehavior: () => ({ y: 0 }),
  routes: configRoutes()
});

router.beforeEach((to, from, next) => {
  const jwt = getToken();
  const publicRoutes = ['Login', '404', 'PasswordForceChange'];
  if (!publicRoutes.includes(to.name)) {
    const redirectTo = to.fullPath;
    if (jwt) {
      // let backend verify the token
      router.app.axios.get(`${router.app.$api.BASE_URL}/${router.app.$api.URL_USER_SELF}`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      }).then(() => {
        // allowed to proceed
        next();
      }).catch(() => {
        // token is stale
        // notify app about this
        EventBus.$emit('authenticated', null);
        // redirect to login page
        next({ name: 'Login', query: { redirect: redirectTo }, replace: true });
      });
    } else {
      // no token at all, redirect to login page
      next({ name: 'Login', query: { redirect: redirectTo }, replace: true });
    }
  } else {
    // allowed to proceed
    next();
  }
});

export default router;