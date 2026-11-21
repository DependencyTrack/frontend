<template>
  <b-modal
    v-model="visible"
    size="lg"
    no-stacking
    :title="$t('admin.select_saml_group')"
    @shown="loadGroups()"
  >
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
    >
    </bootstrap-table>
    <template v-slot:footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">{{
        $t('message.cancel')
      }}</b-button>
      <b-button
        variant="primary"
        @click="$emit('selection', $refs.table.getSelections())"
        >{{ $t('message.select') }}</b-button
      >
    </template>
  </b-modal>
</template>

<script>
import xssFilters from 'xss-filters';
import permissionsMixin from '../../../mixins/permissionsMixin';
import common from '../../../shared/common';
import { fetchAllPages } from '../../../shared/utils';
import modalMixin from '@/mixins/modalMixin';

export default {
  mixins: [permissionsMixin, modalMixin],
  emits: ['selection'],
  data() {
    return {
      columns: [
        {
          field: 'state',
          checkbox: true,
          align: 'center',
        },
        {
          title: this.$t('admin.saml_group_name'),
          field: 'name',
          sortable: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
      ],
      data: [],
      options: {
        clickToSelect: true,
        search: true,
        pagination: true,
        sidePagination: 'client',
        pageList: '[10, 25, 50, 100]',
        pageSize: 10,
      },
    };
  },
  methods: {
    loadGroups: async function () {
      try {
        this.data = await fetchAllPages(
          this.axios,
          `${this.$api.BASE_URL}/${this.$api.URL_SAML_GROUP}`,
        );
      } catch {
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      }
    },
  },
};
</script>
