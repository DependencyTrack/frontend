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
  import nav from '@/_nav'
  import { Sidebar as AppSidebar, SidebarFooter, SidebarForm, SidebarHeader, SidebarMinimizer, SidebarNav, Aside as AppAside, Breadcrumb } from '@coreui/vue'
  import DefaultHeaderProfileDropdown from './DefaultHeaderProfileDropdown'
  import DefaultHeader from './DefaultHeader'
  import DefaultFooter from './DefaultFooter'

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
        nav: nav.items
      }
    },
    computed: {
      name () {
        return this.$route.name
      },
      list () {
        return this.$route.matched.filter((route) => route.name || route.meta.label )
      }
    }
  }
</script>
