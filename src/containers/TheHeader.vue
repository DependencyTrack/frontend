<template>
  <CHeader fixed colorScheme="dark">
    <CToggler
      in-header
      class="ml-3 d-lg-none"
      @click="$store.commit('toggleSidebarMobile')"
    />
    <CToggler
      in-header
      class="ml-3 d-md-down-none"
      @click="$store.commit('toggleSidebarDesktop')"
    />
    <div class="mx-auto">
      <CHeaderBrand class="d-lg-none" to="/">
        <img src="@/assets/img/brand/dt-logo-white-text.svg" width="140" height="30" alt="Dependency-Track Logo"/>
      </CHeaderBrand>
    </div>
    <CHeaderNav class="ml-0">
      <TheHeaderDropdownAccnt/>
    </CHeaderNav>
  </CHeader>
</template>

<script>
import TheHeaderDropdownAccnt from './TheHeaderDropdownAccnt'

export default {
  name: 'TheHeader',
  components: {
    TheHeaderDropdownAccnt
  }
}
</script>