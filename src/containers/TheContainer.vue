<template>
  <div class="c-app">
    <TheSidebar/>
    <CWrapper>
      <TheHeader/>
      <div class="c-body">
        <main class="c-main">
          <CBreadcrumb class="mt-1 mb-4" :items="breadcrumbItems"/>
          <CContainer fluid>
              <router-view :key="$route.path"></router-view>
          </CContainer>
        </main>
      </div>
      <TheFooter/>
    </CWrapper>
  </div>
</template>

<script>
import TheSidebar from './TheSidebar'
import TheHeader from './TheHeader'
import TheFooter from './TheFooter'
import EventBus from '../shared/eventbus';

export default {
  name: 'TheContainer',
  components: {
    TheSidebar,
    TheHeader,
    TheFooter
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
  mounted() {
    if (this.$dtrack && this.$dtrack.version.includes("SNAPSHOT")) {
      this.$root.$emit('bv::show::modal', 'snapshotModal');
    }
  },
  computed: {
    name () {
      return this.$route.name
    },
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
      this.breadcrumbs = this.breadcrumbs.slice(0,-1);
    });
    EventBus.$on('addCrumb', (crumb, subSectionName, subSectionUuid, subsectionLabel) => {
      if (crumb) {
        this.breadcrumbs = this.generateCBreadcrumbs(crumb, subSectionName, subSectionUuid, subsectionLabel);
      } else {
        this.breadcrumbs = [];
      }
    });
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>