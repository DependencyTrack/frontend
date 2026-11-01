<template>
  <b-modal
    v-model="visible"
    size="lg"
    no-stacking
    :title="$t('message.select_project')"
  >
    <b-form-input
      v-model="searchText"
      type="search"
      :aria-label="$t('message.search')"
      :placeholder="$t('message.search')"
      class="mb-2"
    />
    <token-paginated-table
      ref="table"
      :base-url="tableBaseUrl"
      :columns="columns"
      :options="tableOptions"
      :default-page-size="10"
      page-size-storage-key="SelectProjectModalPageSize"
    />
    <template v-slot:footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">{{
        $t('message.cancel')
      }}</b-button>
      <b-button variant="primary" @click="handleSelection">{{
        $t('message.select')
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import xssFilters from 'xss-filters';
import permissionsMixin from '../../../mixins/permissionsMixin';
import common from '../../../shared/common';
import modalMixin from '@/mixins/modalMixin';
import TokenPaginatedTable from '@/views/components/TokenPaginatedTable.vue';

export default {
  mixins: [permissionsMixin, modalMixin],
  components: {
    TokenPaginatedTable,
  },
  props: {
    username: { type: String, default: null },
  },
  emits: ['selection'],
  computed: {
    tableBaseUrl() {
      if (this.username) {
        return `${this.$api.BASE_URL}/${this.$api.URL_ACL_USER}/${this.username}`;
      }
      return common.setQueryParams(
        `${this.$api.BASE_URL}/${this.$api.URL_PROJECTS}`,
        {
          state: 'ACTIVE',
          sort_by: 'name',
          sort_direction: 'ASC',
          name_contains: this.searchText || undefined,
        },
      );
    },
  },
  methods: {
    handleSelection() {
      this.visible = false;
      const selections = this.$refs.table.$refs.table.getSelections();
      this.$emit('selection', selections);
    },
  },
  data() {
    return {
      searchText: '',
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
        clickToSelect: true,
        search: false,
      },
    };
  },
};
</script>
