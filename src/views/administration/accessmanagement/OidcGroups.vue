<template>
  <b-card no-body :header="header">
    <b-card-body>
      <div id="customToolbar">
        <b-button size="md" variant="outline-primary" v-b-modal.createOidcGroupModal>
          <span class="fa fa-plus"></span> {{ $t('admin.create_oidc_group') }}
        </b-button>
      </div>
      <bootstrap-table
        ref="table"
        :columns="columns"
        :data="data"
        :options="options">
      </bootstrap-table>
    </b-card-body>
    <create-oidc-group-modal v-on:refreshTable="refreshTable" />
  </b-card>
</template>

<script>
  import xssFilters from "xss-filters";
  import common from "../../../shared/common";
  import i18n from "../../../i18n";
  import CreateOidcGroupModal from "./CreateOidcGroupModal";
  import bootstrapTableMixin from "../../../mixins/bootstrapTableMixin";
  import EventBus from "../../../shared/eventbus";
  import ActionableListGroupItem from "../../components/ActionableListGroupItem";
  import permissionsMixin from "../../../mixins/permissionsMixin";

  export default {
    props: {
      header: String
    },
    mixins: [bootstrapTableMixin],
    components: {
      CreateOidcGroupModal
    },
    mounted() {
      EventBus.$on('admin:oidcgroups:rowUpdate', (index, row) => {
        this.$refs.table.updateRow( {index: index, row: row});
        this.$refs.table.expandRow(index);
      });
      EventBus.$on('admin:oidcgroups:rowDeleted', (index, row) => {
        this.refreshTable();
      });
    },
    beforeDestroy() {
      EventBus.$off('admin:oidcgroups:rowUpdate');
      EventBus.$off('admin:oidcgroups:rowDeleted');
    },
    data() {
      return {
        columns: [
          {
            title: this.$t('admin.oidc_group_name'),
            field: "name",
            sortable: false,
            formatter(value, row, index) {
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
          onExpandRow: this.vueFormatterInit,
          toolbar: '#customToolbar',
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res;
          },
          url: `${this.$api.BASE_URL}/${this.$api.URL_OIDC_GROUPS}`
        }
      };
    },
    methods: {
      refreshTable: function() {
        this.$refs.table.refresh({
          silent: true
        });
      }
    }
  }
</script>
