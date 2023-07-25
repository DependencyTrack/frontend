<template>
  <b-modal id="ecosystemModal" size="lg" hide-header-close no-stacking :title="$t('admin.select_ecosystem')">
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options">
    </bootstrap-table>
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{ $t('message.cancel') }}</b-button>
      <b-button size="md" variant="primary" @click="$emit('selection', $refs.table.getSelections())">{{ $t('message.select') }}</b-button>
    </template>
  </b-modal>
</template>

<script>
  import xssFilters from "xss-filters";
  import common from "../../../shared/common";

  export default {
    mixins: [],
    data() {
      return {
        columns: [
          {
            field: "state",
            checkbox: true,
            align: "center"
          },
          {
            title: this.$t('message.name'),
            field: "name",
            sortable: true,
            formatter(value) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          }
        ],
        data: [],
        options: {
          search: true,
          showColumns: true,
          showRefresh: true,
          pagination: true,
          silentSort: false,
          sidePagination: 'client',
          queryParamsType: 'pageSize',
          pageList: '[10, 25, 50, 100]',
          pageSize: 10,
          icons: {
            refresh: 'fa-refresh'
          },
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res.map(ecosystem => ({
                name: ecosystem
            }));
          },
          url: `${this.$api.BASE_URL}/${this.$api.URL_OSV_ECOSYSTEM}/inactive`
        }
      };
    }
  }
</script>