<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col xs="6" sm="4" md="4" lg="3" id="admin-menu-column">
        <admin-menu />
      </b-col>
      <b-col xs="6" sm="8" md="8" lg="9">
        <div class="tab-content">
          <!-- Dynamically loads the selected admin plugin -->
          <router-view class="animated fadeIn" :header="header" />
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import EventBus from '../../shared/eventbus';
import AdminMenu from './AdminMenu';

export default {
  components: {
    AdminMenu,
  },
  created() {
    // Specifies the admin plugin metadata (Vue component, i18n name, and href) of the plugin to load
    EventBus.$on('admin:plugin', (plugin) => {
      this.header = plugin.name;
      if (plugin.href) {
        this.href = plugin.href;
      }
    });
  },
  data() {
    return {
      header: this.$t('admin.general'),
      href: '#generalConfigTab',
    };
  },
};
</script>

<style>
.tab-content {
  border: 0;
}
.tab-content .tab-pane {
  padding: 0;
}
.card-header {
  font-weight: 700;
}
@media only screen and (min-device-width: 600px) {
  #admin-menu-column {
    max-width: 280px;
  }
}
</style>
