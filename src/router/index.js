import Vue from 'vue'
import Router from 'vue-router'

// Containers
const DefaultContainer = () => import('@/containers/DefaultContainer');

// Views
const Dashboard = () => import('@/views/Dashboard');
const Projects = () => import('@/views/portfolio/projects/Projects');
const Components = () => import('@/views/portfolio/components/Components');
const Vulnerabilities = () => import('@/views/portfolio/vulnerabilities/Vulnerabilities');
const Licenses = () => import('@/views/portfolio/licenses/Licenses');
const Administration = () => import('@/views/administration/Administration');
const PolicyManagement = () => import('@/views/policy/PolicyManagement');

// Pages
const Login = () => import('@/views/pages/Login');

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
          component: Projects
        },
        {
          path: 'components',
          name: 'Components',
          component: Components
        },
        {
          path: 'vulnerabilities',
          name: 'Vulnerabilities',
          component: Vulnerabilities
        },
        {
          path: 'licenses',
          name: 'Licenses',
          component: Licenses
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
    }
  ]
}

export default new Router({
  mode: 'history', // https://router.vuejs.org/api/#mode
  linkActiveClass: 'open active',
  scrollBehavior: () => ({ y: 0 }),
  routes: configRoutes()
});
