<template>
  <b-modal id="projectAddDependencyModal" @hide="resetValues()" size="md" hide-header-close no-stacking :title="$t('message.add_dependency')">
    <b-tabs class="body-bg-color" style="border-left: 0; border-right:0; border-top:0 ">
      <b-tab class="body-bg-color" style="border-left: 0; border-right:0; border-top:0 " active>
        <template v-slot:title>{{ $t('message.from_existing_component') }}</template>
        <bootstrap-table
          ref="table"
          :columns="columns"
          :data="data"
          :options="options">
        </bootstrap-table>
      </b-tab>
      <b-tab>
        <template v-slot:title>{{ $t('message.from_new_component') }}</template>
        <project-dependencies :uuid="this.uuid"/>
      </b-tab>
    </b-tabs>
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{ $t('message.cancel') }}</b-button>
      <b-button size="md" variant="primary" @click="addDependency()">{{ $t('message.add_dependency') }}</b-button>
    </template>
  </b-modal>
</template>

<script>
  import api from "../../../shared/api";
  import xssFilters from "xss-filters";
  import common from "../../../shared/common";
  import Vue from "vue";
  import SeverityProgressBar from "../../components/SeverityProgressBar";

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
            res.total = xhr.getResponseHeader(`${api.TOTAL_COUNT_HEADER}`);
            return res;
          },
          url: `${api.BASE_URL}/${api.URL_COMPONENT}`
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
        let url = `${api.BASE_URL}/${api.URL_DEPENDENCY}`;
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
