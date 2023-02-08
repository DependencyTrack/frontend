<template>
  <div class="app">
    <DefaultHeader/>
    <div class="app-body">
      <AppSidebar fixed>
        <SidebarHeader/>
        <SidebarForm/>
        <SidebarNav :navItems="permissibleNav"></SidebarNav>
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
    <profile-edit-modal />
    <snapshot-modal/>
  </div>
</template>

<script>
  import { Sidebar as AppSidebar, SidebarFooter, SidebarForm, SidebarHeader, SidebarMinimizer, SidebarNav, Aside as AppAside, Breadcrumb } from '@coreui/vue'
  import DefaultHeaderProfileDropdown from './DefaultHeaderProfileDropdown'
  import DefaultHeader from './DefaultHeader'
  import DefaultFooter from './DefaultFooter'
  import EventBus from '../shared/eventbus';
  import ProfileEditModal from "../views/components/ProfileEditModal";
  import SnapshotModal from "../views/components/SnapshotModal";
  import * as permissions from '../shared/permissions';

  export default {
    name: 'DefaultContainer',
    components: {
      ProfileEditModal,
      SnapshotModal,
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
          icon: 'icon-speedometer',
          permission: permissions.VIEW_PORTFOLIO
        },
        {
          title: true,
          name: this.$t('message.portfolio'),
          class: '',
          wrapper: {
            element: '',
            attributes: {}
          },
          permission: permissions.VIEW_PORTFOLIO
        },
        {
          name: this.$t('message.projects'),
          url: '/projects',
          icon: 'fa fa-sitemap',
          permission: permissions.VIEW_PORTFOLIO
        },
        {
          name: this.$t('message.components'),
          url: '/components',
          icon: 'fa fa-cubes',
          permission: permissions.VIEW_PORTFOLIO
        },
        {
          name: this.$t('message.vulnerabilities'),
          url: '/vulnerabilities',
          icon: 'fa fa-shield',
          permission: permissions.VIEW_PORTFOLIO
        },
        {
          name: this.$t('message.licenses'),
          url: '/licenses',
          icon: 'fa fa-balance-scale',
          permission: permissions.VIEW_PORTFOLIO
        },
          {
            title: true,
            name: this.$t('message.global_audit'),
            class: '',
            wrapper: {
              element: '',
              attributes: {}
            },
            permission: permissions.VIEW_VULNERABILITY
          },
          {
            name: this.$t('message.vulnerability_audit'),
            url: '/vulnerabilityAudit',
            icon: 'fa fa-tasks',
            permission: permissions.VIEW_VULNERABILITY
          },
        {
          title: true,
          name: this.$t('message.administration'),
          class: '',
          wrapper: {
            element: '',
            attributes: {}
          },
          permission: permissions.SYSTEM_CONFIGURATION
        },
        {
          name: this.$t('message.policy_management'),
          url: '/policy',
          icon: 'fa fa-list-alt',
          permission: permissions.POLICY_MANAGEMENT
        },
        {
          name: this.$t('message.administration'),
          url: '/admin',
          icon: 'fa fa-cogs',
          permission: permissions.SYSTEM_CONFIGURATION
        },
      ]
      }
    },
    methods: {
      generateBreadcrumbs: function generateBreadcrumbs(crumbName, subSectionName, subSectionUuid, subSectionLabel) {
        let sectionLabel = this.$t(this.$route.meta.i18n);
        let sectionPath = this.$route.meta.sectionPath;
        if (crumbName && subSectionName && subSectionUuid && subSectionLabel) {
          return [
            { path: '', name: this.$t('message.home') },
            { path: sectionPath, name: sectionLabel },
            { name: subSectionName, params: {uuid: subSectionUuid }, meta: {label: subSectionLabel}},
            { name: crumbName, active: true }
          ];
        } else if (crumbName) {
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
    mounted() {
      if (this.$dtrack && this.$dtrack.version.includes("SNAPSHOT")) {
        this.$root.$emit('bv::show::modal', 'snapshotModal');
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
      },
      permissibleNav () {
        let decodedToken = permissions.decodeToken(permissions.getToken());
        let array = [];
        for (const item of this.nav) {
          if (item.permission !== null && permissions.hasPermission(item.permission, decodedToken)) {
            array.push(item);
          }
        }
        return array;
      }
    },
    created() {
      EventBus.$on('crumble', () => {
        this.breadcrumbs = [];
      });
      EventBus.$on('addCrumb', (crumb, subSectionName, subSectionUuid, subsectionLabel) => {
        if (crumb) {
          this.breadcrumbs = this.generateBreadcrumbs(crumb, subSectionName, subSectionUuid, subsectionLabel);
        } else {
          this.breadcrumbs = [];
        }
      });
    }
  }
</script>
