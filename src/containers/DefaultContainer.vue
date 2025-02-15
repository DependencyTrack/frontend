<template>
  <div class="app">
    <default-header />
    <div class="app-body">
      <AppSidebar ref="sidebar" fixed>
        <SidebarHeader />
        <SidebarForm />
        <SidebarNav :nav-items="permissibleNav"></SidebarNav>
        <SidebarFooter />
        <SidebarMinimizer @click.native="handleMinimizedUpdate" />
      </AppSidebar>
      <main class="main">
        <Breadcrumb :list="list" />
        <div class="container-fluid">
          <router-view></router-view>
        </div>
      </main>
    </div>
    <default-footer />
    <profile-edit-modal />
    <snapshot-modal />
  </div>
</template>

<script>
import {
  Breadcrumb,
  Sidebar as AppSidebar,
  SidebarFooter,
  SidebarForm,
  SidebarHeader,
  SidebarMinimizer,
  SidebarNav,
} from '@coreui/vue';
import DefaultHeader from './DefaultHeader';
import DefaultFooter from './DefaultFooter';
import EventBus from '@/shared/eventbus';
import ProfileEditModal from '@/views/components/ProfileEditModal';
import SnapshotModal from '@/views/components/SnapshotModal';
import * as permissions from '@/shared/permissions';
import { RouterView } from 'vue-router';

export default {
  components: {
    ProfileEditModal,
    SnapshotModal,
    AppSidebar,
    Breadcrumb,
    SidebarForm,
    SidebarFooter,
    SidebarHeader,
    SidebarNav,
    SidebarMinimizer,
    DefaultFooter,
    DefaultHeader,
    RouterView,
  },
  data() {
    return {
      isSidebarMinimized: true,
      breadcrumbs: [],
      nav: [
        {
          name: this.$t('message.dashboard'),
          url: '/dashboard',
          icon: 'icon-speedometer',
          permission: permissions.VIEW_PORTFOLIO,
        },
        {
          title: true,
          name: this.$t('message.portfolio'),
          class: '',
          wrapper: {
            element: '',
            attributes: {},
          },
          permission: permissions.VIEW_PORTFOLIO,
        },
        {
          name: this.$t('message.projects'),
          url: '/projects',
          icon: 'fa fa-sitemap',
          permission: permissions.VIEW_PORTFOLIO,
        },
        {
          name: this.$t('message.components'),
          url: '/components',
          icon: 'fa fa-cubes',
          permission: permissions.VIEW_PORTFOLIO,
        },
        {
          name: this.$t('message.vulnerabilities'),
          url: '/vulnerabilities',
          icon: 'fa fa-shield',
          permission: permissions.VIEW_PORTFOLIO,
        },
        {
          name: this.$t('message.licenses'),
          url: '/licenses',
          icon: 'fa fa-balance-scale',
          permission: permissions.VIEW_PORTFOLIO,
        },
        {
          name: 'Tags',
          url: '/tags',
          icon: 'fa fa-tag',
          permission: permissions.VIEW_PORTFOLIO,
        },
        {
          title: true,
          name: this.$t('message.global_audit'),
          class: '',
          wrapper: {
            element: '',
            attributes: {},
          },
          permissions: [
            permissions.VIEW_VULNERABILITY,
            permissions.VIEW_POLICY_VIOLATION,
          ],
        },
        {
          name: this.$t('message.vulnerability_audit'),
          url: '/vulnerabilityAudit',
          icon: 'fa fa-tasks',
          permission: permissions.VIEW_VULNERABILITY,
        },
        {
          name: this.$t('message.policy_violation_audit'),
          url: '/policyViolationAudit',
          icon: 'fa fa-fire',
          permission: permissions.VIEW_POLICY_VIOLATION,
        },
        {
          title: true,
          name: this.$t('message.administration'),
          class: '',
          wrapper: {
            element: '',
            attributes: {},
          },
          permission: permissions.SYSTEM_CONFIGURATION,
        },
        {
          name: this.$t('message.policy_management'),
          url: '/policy',
          icon: 'fa fa-list-alt',
          permission: permissions.POLICY_MANAGEMENT,
        },
        {
          name: this.$t('message.administration'),
          url: '/admin',
          icon: 'fa fa-cogs',
          permission: permissions.SYSTEM_CONFIGURATION,
        },
      ],
    };
  },
  computed: {
    name() {
      return this.$route.name;
    },
    list() {
      if (this.breadcrumbs.length === 0) {
        return this.generateBreadcrumbs();
      } else {
        return this.breadcrumbs;
      }
    },
    permissibleNav() {
      let decodedToken = permissions.decodeToken(permissions.getToken());
      let array = [];
      for (const item of this.nav) {
        if (
          (item.permission !== null &&
            permissions.hasPermission(item.permission, decodedToken)) ||
          (Object.prototype.hasOwnProperty.call(item, 'permissions') &&
            item.permissions.some((permission) =>
              permissions.hasPermission(permission, decodedToken),
            ))
        ) {
          array.push(item);
        }
      }
      return array;
    },
  },
  mounted() {
    if (this.$dtrack && this.$dtrack.version.includes('SNAPSHOT')) {
      this.$root.$emit('bv::show::modal', 'snapshotModal');
    }

    this.isSidebarMinimized =
      localStorage && localStorage.getItem('isSidebarMinimized') !== null
        ? localStorage.getItem('isSidebarMinimized') === 'true'
        : false;
    const sidebar = document.body;
    if (sidebar) {
      if (this.isSidebarMinimized) {
        sidebar.classList.add('sidebar-minimized');
      } else {
        sidebar.classList.remove('sidebar-minimized');
      }
    }
  },
  created() {
    EventBus.$on('crumble', () => {
      this.breadcrumbs = [];
    });
    EventBus.$on(
      'addCrumb',
      (crumb, subSectionName, subSectionUuid, subsectionLabel) => {
        if (crumb) {
          this.breadcrumbs = this.generateBreadcrumbs(
            crumb,
            subSectionName,
            subSectionUuid,
            subsectionLabel,
          );
        } else {
          this.breadcrumbs = [];
        }
      },
    );
  },
  methods: {
    handleMinimizedUpdate() {
      this.isSidebarMinimized = !this.isSidebarMinimized;
      if (localStorage) {
        localStorage.setItem('isSidebarMinimized', this.isSidebarMinimized);
      }
    },
    generateBreadcrumbs(
      crumbName,
      subSectionName,
      subSectionUuid,
      subSectionLabel,
    ) {
      let sectionName = this.$route.meta.sectionName;
      let sectionLabel = this.$t(this.$route.meta.i18n);
      let sectionPath = this.$route.meta.sectionPath;
      if (crumbName && subSectionName && subSectionUuid && subSectionLabel) {
        return [
          { path: '', name: 'Home', meta: { label: this.$t('message.home') } },
          {
            path: sectionPath,
            name: sectionName,
            meta: { label: sectionLabel },
          },
          {
            name: subSectionName,
            params: { uuid: subSectionUuid },
            meta: { label: subSectionLabel },
          },
          { name: crumbName, active: true },
        ];
      } else if (crumbName) {
        return [
          { path: '', name: 'Home', meta: { label: this.$t('message.home') } },
          {
            path: sectionPath,
            name: sectionName,
            meta: { label: sectionLabel },
          },
          { name: crumbName, active: true },
        ];
      } else {
        return [
          { path: '', name: 'Home', meta: { label: this.$t('message.home') } },
          {
            path: sectionPath,
            name: sectionName,
            meta: { label: sectionLabel },
          },
        ];
      }
    },
  },
};
</script>
