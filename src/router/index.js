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
          component: Dashboard
        },
        {
          path: 'projects',
          name: 'Projects',
          component: ProjectList
        },
        {
          path: 'components',
          name: 'Components',
          component: ComponentList
        },
        {
          path: 'vulnerabilities',
          name: 'Vulnerabilities',
          component: VulnerabilityList
        },
        {
          path: 'licenses',
          name: 'Licenses',
          component: LicenseList
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
        }
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
