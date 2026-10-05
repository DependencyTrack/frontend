<template>
  <b-modal
    id="selectProjectModal"
    size="lg"
    hide-header-close
    no-stacking
    v-permission="'VIEW_PORTFOLIO'"
    :title="$t('message.select_project')"
  >
    <token-paginated-table
      ref="table"
      :base-url="tableBaseUrl"
      :columns="columns"
      :options="tableOptions"
      :default-page-size="10"
      page-size-storage-key="SelectProjectModalPageSize"
    />
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.cancel')
      }}</b-button>
      <b-button size="md" variant="primary" @click="handleSelection">{{
        $t('message.select')
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import xssFilters from 'xss-filters';
import permissionsMixin from '../../../mixins/permissionsMixin';
import common from '../../../shared/common';
import TokenPaginatedTable from '@/views/components/TokenPaginatedTable.vue';

export default {
  mixins: [permissionsMixin],
  components: {
    TokenPaginatedTable,
  },
  props: {
    username: { type: String, default: null },
  },
  computed: {
    tableBaseUrl() {
      if (this.username) {
        return `${this.$api.BASE_URL}/${this.$api.URL_ACL_USER}/${this.username}`;
      }
      return common.setQueryParams(
        `${this.$api.BASE_URL}/${this.$api.URL_PROJECTS}`,
        {
          is_active: 'ACTIVE',
          sort_by: 'name',
          sort_direction: 'ASC',
        },
      );
    },
  },
  methods: {
    handleSelection() {
      this.$root.$emit('bv::hide::modal', this.$children[0].id);
      const selections = this.$refs.table.$refs.table.getSelections();
      this.$emit('selection', selections);
    },
  },
  data() {
    return {
      columns: [
        {
          field: 'state',
          checkbox: true,
          align: 'center',
        },
        {
          title: this.$t('message.project_name'),
          field: 'name',
          sortable: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.version'),
          field: 'version',
          sortable: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.active'),
          field: 'is_active',
          formatter(value) {
            return value === 'ACTIVE' || value === true
              ? '<i class="fa fa-check-square-o" />'
              : '';
          },
          align: 'center',
          class: 'tight',
        },
      ],
      tableOptions: {
        search: false,
      },
    };
  },
};
</script>
