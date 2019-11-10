import Vue from 'vue'
import Router from 'vue-router'

// Containers
const DefaultContainer = () => import('@/containers/DefaultContainer');

// Views
const Dashboard = () => import('@/views/Dashboard');
const ProjectList = () => import('@/views/portfolio/projects/ProjectList');
const ComponentList = () => import('@/views/portfolio/components/ComponentList');
const VulnerabilityList = () => import('@/views/portfolio/vulnerabilities/VulnerabilityList');
const LicenseList = () => import('@/views/portfolio/licenses/LicenseList');
const Administration = () => import('@/views/administration/Administration');
const PolicyManagement = () => import('@/views/policy/PolicyManagement');

const Project = () => import('@/views/portfolio/projects/Project');
const Component = () => import('@/views/portfolio/components/Component');

// Pages
const Login = () => import('@/views/pages/Login');
const PasswordForceChange = () => import('@/views/pages/PasswordForceChange');

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
            i18n: 'message.dashboard',
            sectionPath: '/dashboard'
          }
        },
        {
          path: 'projects',
          name: 'Projects',
          component: ProjectList,
          meta: {
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
          name: 'Components',
          component: ComponentList,
          meta: {
            i18n: 'message.components',
            sectionPath: '/components'
          }
        },
        {
          path: 'components/:uuid',
          name: 'Component',
          props: (route) => ( { uuid: route.params.uuid } ),
          component: Component,
          meta: {
            i18n: 'message.components',
            sectionPath: '/components'
          }
        },
        {
          path: 'vulnerabilities',
          name: 'Vulnerabilities',
          component: VulnerabilityList,
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
            i18n: 'message.licenses',
            sectionPath: '/licenses'
          }
        },
        {
          path: 'policy',
          name: 'Policy Management',
          component: PolicyManagement
        },
        {
          path: 'admin',
          name: 'Administration',
          component: Administration
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
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/change-password',
      name: 'PasswordForceChange',
      component: PasswordForceChange
    }
  ]
}

export default new Router({
  mode: 'history', // https://router.vuejs.org/api/#mode
  linkActiveClass: 'open active',
  scrollBehavior: () => ({ y: 0 }),
  routes: configRoutes()
});
