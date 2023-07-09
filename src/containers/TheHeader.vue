<template>
  <CHeader fixed with-subheader colorScheme="dark">
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
    <CSubheader class="px-3 pb-0 mb-0">
      <CBreadcrumb class="my-0 pb-0" :items="breadcrumbItems"/>
    </CSubheader>
  </CHeader>
</template>

<script>
import TheHeaderDropdownAccnt from './TheHeaderDropdownAccnt'
import EventBus from '../shared/eventbus';

export default {
  name: 'TheHeader',
  components: {
    TheHeaderDropdownAccnt
  },
  data () {
    return {
      breadcrumbs: [],
    }
  },
  methods: {
    generateCBreadcrumbs: function (crumbName, subSectionName, subSectionUuid, subSectionLabel) {
      let sectionLabel = this.$t(this.$route.meta.i18n);
      let sectionPath = this.$route.meta.sectionPath;
      if (crumbName && subSectionName && subSectionUuid && subSectionLabel) {
        return [
          { href: '/dashboard', text: this.$t('message.home') },
          { href: sectionPath, text: sectionLabel },
          { text: subSectionLabel, href: sectionPath + '/' + subSectionUuid },
          { text: crumbName, active: true }
        ];
      } else if (crumbName) {
        return [
          { href: '/dashboard', text: this.$t('message.home') },
          { href: sectionPath, text: sectionLabel },
          { text: crumbName, active: true }
        ];
      } else {
        return [
          { href: '/dashboard', text: this.$t('message.home') },
          { href: sectionPath, text: sectionLabel }
        ];
      }
    }
  },
  computed: {
    breadcrumbItems () {
      if (this.breadcrumbs.length === 0) {
        return this.generateCBreadcrumbs();
      } else {
        return this.breadcrumbs;
      }
    }
  },
  created() {
    EventBus.$on('crumble', () => {
      // Don't update breadcrumbs twice, only once on addCrumb:
      // this.breadcrumbs = this.breadcrumbs.slice(0,-1);
    });
    EventBus.$on('addCrumb', (crumb, subSectionName, subSectionUuid, subsectionLabel) => {
      // console.log('addCrumb');
      if (crumb) {
        this.breadcrumbs = this.generateCBreadcrumbs(crumb, subSectionName, subSectionUuid, subsectionLabel);
      } else {
        this.breadcrumbs = [];
      }
    });
  }
}
</script>