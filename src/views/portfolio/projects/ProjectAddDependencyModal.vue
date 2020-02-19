<template>
  <b-modal id="projectAddDependencyModal" @hide="resetValues()" size="md" hide-header-close no-stacking :title="$t('message.add_dependency')">
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options">
    </bootstrap-table>
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{ $t('message.cancel') }}</b-button>
      <b-button size="md" variant="primary" @click="addDependency()">{{ $t('message.add_dependency') }}</b-button>
    </template>
  </b-modal>
</template>

<script>
  import xssFilters from "xss-filters";
  import common from "../../../shared/common";

  export default {
    name: "ProjectAddDependencyModal",
    props: {
      uuid: String
    },
    data() {
      return {
        columns: [
          {
            field: "state",
            checkbox: true,
            align: "center"
          },
          {
            title: this.$t('message.component'),
            field: "name",
            sortable: true,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('message.version'),
            field: "version",
            sortable: true,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('message.group'),
            field: "group",
            sortable: true,
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
          sidePagination: 'server',
          queryParamsType: 'pageSize',
          pageList: '[5, 10, 25]',
          pageSize: 5,
          icons: {
            refresh: 'fa-refresh'
          },
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res;
          },
          url: `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}`
        }
      };
    },
    methods: {
      resetValues: function () {
        //this.something = null;
      },
      addDependency: function () {
        let selections = this.$refs.table.getSelections();
        let componentUuids = [];
        for (let i=0; i<selections.length; i++) {
          componentUuids[i] = selections[i].uuid;
        }
        let url = `${this.$api.BASE_URL}/${this.$api.URL_DEPENDENCY}`;
        this.axios.put(url,  {
            projectUuid: this.uuid,
            componentUuids: componentUuids,
            notes: null
        }).then((response) => {
          this.$refs.table.refresh({ silent: true });
          this.$toastr.s(this.$t('message.dependency_added'));
        }).catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
        this.$refs.table.uncheckAll();
        this.$root.$emit('bv::hide::modal', 'projectAddDependencyModal');
      }
    }
  }
</script>
