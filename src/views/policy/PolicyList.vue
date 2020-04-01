<template>
  <div class="animated fadeIn" v-permission="'POLICY_MANAGEMENT'">
    <div id="policiesToolbar" class="bs-table-custom-toolbar">
      <b-button size="md" variant="outline-primary" v-b-modal.createPolicyModal v-permission="PERMISSIONS.POLICY_MANAGEMENT">
        <span class="fa fa-plus"></span> {{ $t('message.create_policy') }}
      </b-button>
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      v-on:onLoadSuccess="tableLoaded" />
    <create-policy-modal v-on:refreshTable="refreshTable" />
  </div>
</template>

<script>
  import common from "../../shared/common";
  import xssFilters from "xss-filters";
  import CreatePolicyModal from "./CreatePolicyModal";
  import permissionsMixin from "../../mixins/permissionsMixin";
  import i18n from "../../i18n";
  import ActionableListGroupItem from "../components/ActionableListGroupItem";
  import BValidatedInputGroupFormInput from "../../forms/BValidatedInputGroupFormInput";
  import EventBus from "../../shared/eventbus";
  import bootstrapTableMixin from "../../mixins/bootstrapTableMixin";
  import BInputGroupFormSelect from "../../forms/BInputGroupFormSelect";

  export default {
    mixins: [permissionsMixin, bootstrapTableMixin],
    components: {
      CreatePolicyModal
    },
    mounted() {
      EventBus.$on('policyManagement:policies:rowUpdate', (index, row) => {
        this.$refs.table.updateRow( {index: index, row: row});
        this.$refs.table.expandRow(index);
      });
      EventBus.$on('policyManagement:policies:rowDeleted', (index, row) => {
        this.refreshTable();
      });
    },
    beforeDestroy() {
      EventBus.$off('policyManagement:policies:rowUpdate');
      EventBus.$off('policyManagement:policies:rowDeleted');
    },
    methods: {
      tableLoaded: function(data) {
        if (data && Object.prototype.hasOwnProperty.call(data, "total")) {
          this.$emit('total', data.total);
        } else {
          this.$emit('total', '?');
        }
      },
      refreshTable: function() {
        this.$refs.table.refresh({
          silent: true
        });
      }
    },
    data() {
      return {
        columns: [
          {
            title: this.$t('message.name'),
            field: "name",
            sortable: true,
            formatter(value, row, index) {
              return common.formatNotificationLabel(row.violationState) + ` ${xssFilters.inHTMLData(value)}`;
              //return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          }
        ],
        data: [],
        options: {
          showHeader: false,
          search: true,
          showColumns: false,
          showRefresh: true,
          pagination: true,
          silentSort: false,
          sidePagination: 'server',
          queryParamsType: 'pageSize',
          pageList: '[10, 25, 50, 100]',
          pageSize: 10,
          icons: {
            refresh: 'fa-refresh'
          },
          detailView: true,
          detailViewIcon: false,
          detailViewByClick: true,
          detailFormatter: (index, row) => {
            return this.vueFormatter({
              i18n,
              template: `
                <div>
                <b-row class="expanded-row">
                  <b-col sm="6">
                    <b-validated-input-group-form-input id="identifier"
                                                        :label="this.$t('message.name')"
                                                        input-group-size="mb-3"
                                                        rules="required"
                                                        v-model="name" />
                  </b-col>
                  <b-col sm="3">
                    <b-input-group-form-select id="input-repository-type" required="true"
                               v-model="operator" :options="operators"
                               :label="$t('message.operator')" />
                  </b-col>
                  <b-col sm="3">
                    <b-input-group-form-select id="input-repository-type" required="true"
                               v-model="violationState" :options="violationStates"
                               :label="$t('message.violation_state')" />
                  </b-col>
                </b-row>
                <b-row class="expanded-row">
                  <b-col sm="6">
                  </b-col>

                  <b-col sm="6">



                    <div style="text-align:right">
                       <b-button variant="outline-danger" @click="deletePolicy">{{ $t('message.delete_policy') }}</b-button>
                    </div>
                  </b-col>
                </b-row>
                </div>
              `,
              mixins: [permissionsMixin],
              components: {
                ActionableListGroupItem,
                BValidatedInputGroupFormInput,
                BInputGroupFormSelect
              },
              data() {
                return {
                  policy: row,
                  name: row.name,
                  operator: row.operator,
                  violationState: row.violationState,
                  selected: 'radio1',
                  operators: [
                    { value: 'ANY', text: 'Any' },
                    { value: 'ALL', text: 'All' }
                  ],
                  violationStates: [
                    { value: 'INFO', text: 'Informational'},
                    { value: 'WARN', text: 'Warning' },
                    { value: 'FAIL', text: 'Fail' }
                  ]
                }
              },
              methods: {
                deletePolicy: function() {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_POLICY}/${this.policy.uuid}`;
                  this.axios.delete(url).then((response) => {
                    EventBus.$emit('policyManagement:policies:rowDeleted', index);
                    this.$toastr.s(this.$t('message.policy_deleted'));
                  }).catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
                },
                syncVariables: function(policy) {
                  this.policy = policy;
                  this.name = policy.name;
                  this.operator = policy.operator;
                  this.violationState = policy.violationState;
                }
              }
            })
          },
          onExpandRow: this.vueFormatterInit,
          toolbar: '#policiesToolbar',
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res;
          },
          url: `${this.$api.BASE_URL}/${this.$api.URL_POLICY}`
        }
      };
    }
  };
</script>
