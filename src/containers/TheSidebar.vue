<template>
  <CSidebar
    fixed
    :minimize="minimize"
    :show="show"
    @update:show="(value) => $store.commit('set', ['sidebarShow', value])"
  >
    <CSidebarBrand class="d-md-down-none" to="/">
      <img v-if="minimize" style="margin-left: 10px;" src="@/assets/img/brand/dt-logo-symbol.svg" width="30" height="30" alt="Dependency-Track Logo"/>
      <img v-if="!minimize" style="margin-left: 1rem;" src="@/assets/img/brand/dt-logo-white-text.svg" width="140" height="30" alt="Dependency-Track Logo"/>
    </CSidebarBrand>

    <CRenderFunction flat :content-to-render="permissibleNav" />
    <CSidebarMinimizer
      class="d-md-down-none"
      @click.native="$store.commit('set', ['sidebarMinimize', !minimize])"
    />
  </CSidebar>
</template>

<script>
import * as permissions from '../shared/permissions';
export default {
  name: 'TheSidebar',
  data() {
    return {
      navItems: [
        {
          _name: 'CSidebarNavItem',
          name: this.$t('message.dashboard'),
          to: '/dashboard',
          fontIcon: 'cil-speedometer',
          permission: permissions.VIEW_PORTFOLIO
        },
        {
          _name: 'CSidebarNavTitle',
          _children: [this.$t('message.portfolio')],
          permission: permissions.VIEW_PORTFOLIO
        },
        {
          _name: 'CSidebarNavItem',
          name: this.$t('message.projects'),
          to: '/projects',
          fontIcon: 'fa fa-sitemap',
          permission: permissions.VIEW_PORTFOLIO
        },
        {
          _name: 'CSidebarNavItem',
          name: this.$t('message.components'),
          to: '/components',
          fontIcon: 'fa fa-cubes',
          permission: permissions.VIEW_PORTFOLIO
        },
        {
          _name: 'CSidebarNavItem',
          name: this.$t('message.vulnerabilities'),
          to: '/vulnerabilities',
          fontIcon: 'fa fa-shield',
          permission: permissions.VIEW_PORTFOLIO
        },
        {
          _name: 'CSidebarNavItem',
          name: this.$t('message.licenses'),
          to: '/licenses',
          fontIcon: 'fa fa-balance-scale',
          permission: permissions.VIEW_PORTFOLIO
        },
        {
          _name: 'CSidebarNavTitle',
          _children: [this.$t('message.administration')],
          permission: permissions.SYSTEM_CONFIGURATION
        },
        {
          _name: 'CSidebarNavItem',
          name: this.$t('message.policy_management'),
          to: '/policy',
          fontIcon: 'fa fa-list-alt',
          permission: permissions.POLICY_MANAGEMENT
        },
        {
          _name: 'CSidebarNavItem',
          name: this.$t('message.administration'),
          to: '/admin',
          fontIcon: 'fa fa-cogs',
          permission: permissions.SYSTEM_CONFIGURATION
          }
      ]
    };

  },
  computed: {
    permissibleNav() {
      let decodedToken = permissions.decodeToken(permissions.getToken());
      let array = [];
      for (const item of this.navItems) {
        if (item.permission !== null && permissions.hasPermission(item.permission, decodedToken)) {
          array.push(item);
        }
      }
      return [{
        _name: 'CSidebarNav',
        _children: array
      }];
    },
    show() {
      return this.$store.state.sidebarShow
    },
    minimize() {
      return this.$store.state.sidebarMinimize
    }
  }
}
</script>