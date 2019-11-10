<template>
  <div class="app">
    <DefaultHeader/>
    <div class="app-body">
      <AppSidebar fixed>
        <SidebarHeader/>
        <SidebarForm/>
        <SidebarNav :navItems="nav"></SidebarNav>
        <SidebarFooter/>
        <SidebarMinimizer/>
      </AppSidebar>
      <main class="main">
        <Breadcrumb :list="list"/>
        <div class="container-fluid">
          <router-view></router-view>
        </div>
      </main>
    </div>
    <DefaultFooter/>
  </div>
</template>

<script>
  import { Sidebar as AppSidebar, SidebarFooter, SidebarForm, SidebarHeader, SidebarMinimizer, SidebarNav, Aside as AppAside, Breadcrumb } from '@coreui/vue'
  import DefaultHeaderProfileDropdown from './DefaultHeaderProfileDropdown'
  import DefaultHeader from './DefaultHeader'
  import DefaultFooter from './DefaultFooter'
  import EventBus from '../shared/eventbus';

  export default {
    name: 'DefaultContainer',
    components: {
      AppSidebar,
      AppAside,
      Breadcrumb,
      DefaultHeaderProfileDropdown,
      SidebarForm,
      SidebarFooter,
      SidebarHeader,
      SidebarNav,
      SidebarMinimizer,
      DefaultFooter,
      DefaultHeader
    },
    data () {
      return {
        breadcrumbs: [],
        nav: [
        {
          name: this.$t('message.dashboard'),
          url: '/dashboard',
          icon: 'icon-speedometer'
        },
        {
          title: true,
          name: this.$t('message.portfolio'),
          class: '',
          wrapper: {
            element: '',
            attributes: {}
          }
        },
        {
          name: this.$t('message.projects'),
          url: '/projects',
          icon: 'fa fa-sitemap'
        },
        {
          name: this.$t('message.components'),
          url: '/components',
          icon: 'fa fa-cubes'
        },
        {
          name: this.$t('message.vulnerabilities'),
          url: '/vulnerabilities',
          icon: 'fa fa-shield'
        },
        {
          name: this.$t('message.licenses'),
          url: '/licenses',
          icon: 'fa fa-balance-scale'
        },
        {
          title: true,
          name: this.$t('message.administration'),
          class: '',
          wrapper: {
            element: '',
            attributes: {}
          }
        },
        {
          name: this.$t('message.policy_management'),
          url: '/policy',
          icon: 'fa fa-list-alt'
        },
        {
          name: this.$t('message.administration'),
          url: '/admin',
          icon: 'fa fa-cogs'
        }
      ]
      }
    },
    methods: {
      generateBreadcrumbs: function generateBreadcrumbs(crumbName) {
        let sectionLabel = this.$t(this.$route.meta.i18n);
        let sectionPath = this.$route.meta.sectionPath;
        if (crumbName) {
          return [
            { path: '', name: this.$t('message.home') },
            { path: sectionPath, name: sectionLabel },
            { name: crumbName, active: true }
          ];
        } else {
          return [
            { path: '', name: this.$t('message.home') },
            { path: sectionPath, name: sectionLabel }
          ];
        }
      }
    },
    computed: {
      name () {
        return this.$route.name
      },
      list () {
        if (this.breadcrumbs.length === 0) {
          return this.generateBreadcrumbs();
        } else {
          return this.breadcrumbs;
        }
      }
    },
    created() {
      EventBus.$on('crumble', () => {
        this.breadcrumbs = [];
      });
      EventBus.$on('addCrumb', (crumb) => {
        if (crumb) {
          this.breadcrumbs = this.generateBreadcrumbs(crumb);
        } else {
          this.breadcrumbs = [];
        }
      });
    }
  }
</script>
