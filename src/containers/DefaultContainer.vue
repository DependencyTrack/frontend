<template>
  <div class="app">
    <DefaultHeader />
    <div class="app-body">
      <div ref="sidebar" class="sidebar">
        <div class="sidebar-brand">
          <img
            class="sidebar-brand-full"
            src="@/assets/img/brand/dt-logo-white-text.svg"
            height="32"
            alt="Dependency-Track Logo"
          />
          <img
            class="sidebar-brand-minimized"
            src="@/assets/img/brand/dt-logo-symbol.svg"
            height="26"
            alt="Dependency-Track Logo"
          />
        </div>
        <nav class="sidebar-nav">
          <ul class="nav">
            <template v-for="item in permissibleNav">
              <li v-if="item.title" :key="item.name" class="nav-title">
                {{ item.name }}
              </li>
              <li
                v-else
                :key="item.url"
                class="nav-item"
                @click="hideMobileSidebar"
              >
                <router-link
                  :to="item.url"
                  class="nav-link"
                  v-bind="item.attributes"
                >
                  <i class="nav-icon" :class="item.icon"></i> {{ item.name }}
                </router-link>
              </li>
            </template>
          </ul>
        </nav>
        <ul class="nav sidebar-profile">
          <ProfileDropdown
            @editProfile="showProfileEditModal = true"
            @about="showAboutModal = true"
          />
        </ul>
        <div class="sidebar-footer">
          <button
            class="sidebar-about"
            type="button"
            @click="showAboutModal = true"
          >
            {{ dtrack.application }}
            <span class="d-block">v{{ dtrack.version }}</span>
          </button>
          <button
            class="sidebar-minimizer"
            type="button"
            @click="handleMinimizedUpdate"
          ></button>
        </div>
      </div>
      <profile-edit-modal v-model="showProfileEditModal" />
      <about-modal v-model="showAboutModal" />
      <main class="main">
        <ol class="breadcrumb">
          <template v-for="(crumb, index) in list">
            <li
              v-if="crumb.name || crumb.meta.label"
              :key="index"
              class="breadcrumb-item"
            >
              <span v-if="index === list.length - 1" class="active">{{
                (crumb.meta && crumb.meta.label) || crumb.name
              }}</span>
              <router-link v-else :to="crumb">{{
                (crumb.meta && crumb.meta.label) || crumb.name
              }}</router-link>
            </li>
          </template>
        </ol>
        <div class="container-fluid">
          <router-view></router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import DefaultHeader from './DefaultHeader.vue';
import ProfileDropdown from './ProfileDropdown.vue';
import AboutModal from '../views/components/AboutModal.vue';
import ProfileEditModal from '../views/components/ProfileEditModal.vue';
import EventBus from '../shared/eventbus';
import state from '../shared/state';
import * as permissions from '../shared/permissions';
import * as featureFlags from '@/shared/featureFlags';

export default {
  name: 'DefaultContainer',
  components: {
    AboutModal,
    DefaultHeader,
    ProfileDropdown,
    ProfileEditModal,
  },
  data() {
    return {
      showProfileEditModal: false,
      showAboutModal: false,
      isSidebarMinimized: true,
      breadcrumbs: [],
      nav: [
        {
          name: this.$t('message.dashboard'),
          url: '/dashboard',
          icon: 'fa-solid fa-gauge-high',
          permission: permissions.VIEW_PORTFOLIO,
        },
        {
          title: true,
          name: this.$t('message.portfolio'),
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
      document.body.classList.toggle(
        'sidebar-minimized',
        this.isSidebarMinimized,
      );
      if (localStorage) {
        localStorage.setItem('isSidebarMinimized', this.isSidebarMinimized);
      }
    },
    hideMobileSidebar() {
      document.body.classList.remove('sidebar-show');
    },
    onDocumentClick(event) {
      if (!this.$refs.sidebar.contains(event.target)) {
        this.hideMobileSidebar();
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
    document.body.classList.add('sidebar-fixed', 'sidebar-lg-show');
    document.body.classList.toggle(
      'sidebar-minimized',
      this.isSidebarMinimized,
    );
    document.addEventListener('click', this.onDocumentClick);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.onDocumentClick);
  },
  computed: {
    dtrack: () => state.dtrack,
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
          // Router 4 marks a link active only on its own route, Router 3 also on the paths below it.
          const path = this.$route.path;
          const active =
            item.url && (path === item.url || path.startsWith(`${item.url}/`));
          array.push(
            active ? { ...item, attributes: { class: 'open active' } } : item,
          );
        }
      }
      return array;
    },
  },
  created() {
    EventBus.on('crumble', () => {
      this.breadcrumbs = [];
    });
    EventBus.on(
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
