<template>
  <div class="app">
    <DefaultHeader />
    <div class="app-body">
      <AppSidebar ref="sidebar" fixed>
        <SidebarHeader />
        <SidebarForm />
        <SidebarNav :navItems="permissibleNav"></SidebarNav>
        <SidebarFooter />
        <SidebarMinimizer />
      </AppSidebar>
      <main class="main">
        <Breadcrumb :list="list" />
        <div class="container-fluid">
          <router-view></router-view>
        </div>
      </main>
    </div>
    <DefaultFooter />
    <profile-edit-modal />
  </div>
</template>

<script>
import {
  Sidebar as AppSidebar,
  SidebarFooter,
  SidebarForm,
  SidebarHeader,
  SidebarMinimizer,
  SidebarNav,
  Breadcrumb,
} from '@coreui/vue';
import DefaultHeader from './DefaultHeader';
import DefaultFooter from './DefaultFooter';
import EventBus from '../shared/eventbus';
import ProfileEditModal from '../views/components/ProfileEditModal';
import * as permissions from '../shared/permissions';
import * as featureFlags from '@/shared/featureFlags';

export default {
  name: 'DefaultContainer',
  components: {
    ProfileEditModal,
    AppSidebar,
    Breadcrumb,
    SidebarForm,
    SidebarFooter,
    SidebarHeader,
    SidebarNav,
    SidebarMinimizer,
    DefaultFooter,
    DefaultHeader,
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
          featureFlags: [
            featureFlags.GLOBAL_POLICY_VIOLATION_AUDIT,
            featureFlags.GLOBAL_VULNERABILITY_AUDIT,
          ],
        },
        {
          name: this.$t('message.vulnerability_audit'),
          url: '/vulnerabilityAudit',
          icon: 'fa fa-tasks',
          permission: permissions.VIEW_VULNERABILITY,
          featureFlags: [featureFlags.GLOBAL_VULNERABILITY_AUDIT],
        },
        {
          name: this.$t('message.policy_violation_audit'),
          url: '/policyViolationAudit',
          icon: 'fa fa-fire',
          permission: permissions.VIEW_POLICY_VIOLATION,
          featureFlags: [featureFlags.GLOBAL_POLICY_VIOLATION_AUDIT],
        },
        {
          title: true,
          name: this.$t('message.administration'),
          class: '',
          wrapper: {
            element: '',
            attributes: {},
          },
          permission: [
            permissions.SYSTEM_CONFIGURATION,
            permissions.SYSTEM_CONFIGURATION_CREATE,
            permissions.SYSTEM_CONFIGURATION_READ,
            permissions.SYSTEM_CONFIGURATION_UPDATE,
            permissions.SYSTEM_CONFIGURATION_DELETE,
          ],
        },
        {
          name: this.$t('message.policy_management'),
          url: '/policy',
          icon: 'fa fa-list-alt',
          permission: [
            permissions.POLICY_MANAGEMENT,
            permissions.POLICY_MANAGEMENT_CREATE,
            permissions.POLICY_MANAGEMENT_READ,
            permissions.POLICY_MANAGEMENT_UPDATE,
            permissions.POLICY_MANAGEMENT_DELETE,
          ],
        },
        {
          name: this.$t('message.administration'),
          url: '/admin',
          icon: 'fa fa-cogs',
          permission: [
            permissions.SYSTEM_CONFIGURATION,
            permissions.SYSTEM_CONFIGURATION_CREATE,
            permissions.SYSTEM_CONFIGURATION_READ,
            permissions.SYSTEM_CONFIGURATION_UPDATE,
            permissions.SYSTEM_CONFIGURATION_DELETE,
          ],
        },
      ],
    };
  },
  methods: {
    handleMinimizedUpdate() {
      this.isSidebarMinimized = !this.isSidebarMinimized;
      if (localStorage) {
        localStorage.setItem('isSidebarMinimized', this.isSidebarMinimized);
      }
    },
    generateBreadcrumbs: function generateBreadcrumbs(
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
  mounted() {
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
    this.$nextTick(() => {
      const sidebarMinimizer = this.$el.querySelector('.sidebar-minimizer');
      if (sidebarMinimizer) {
        sidebarMinimizer.addEventListener('click', this.handleMinimizedUpdate);
      }
    });
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
      let array = [];
      for (const item of this.nav) {
        if (
          item.featureFlags &&
          Array.isArray(item.featureFlags) &&
          !this.$isAnyFeatureEnabled(item.featureFlags)
        ) {
          continue;
        }

        if (
          (item.permission !== null &&
            permissions.hasPermission(item.permission)) ||
          (Object.prototype.hasOwnProperty.call(item, 'permissions') &&
            item.permissions.some((permission) =>
              permissions.hasPermission(permission),
            ))
        ) {
          array.push(item);
        }
      }
      return array;
    },
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
};
</script>
